const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const dayjs = require("dayjs");

// @route    POST api/order
// @desc     make order and get your bill

router.post(
  "/",
  [
    check("basket", "user is required").not().isEmpty(),
    check("user", "user is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { user, basket } = req.body;
    console.log({ user });
    let createdAt = dayjs(user.createdAt).unix();

    let now = dayjs().unix();
    let yearsDiff = now - createdAt;
    yearsDiff = yearsDiff / (60 * 60 * 24 * 365);
    yearsDiff = Math.floor(yearsDiff);
    console.log({ yearsDiff });

    try {
      let total = basket.reduce(
        (accumulatedQuantity, cartItem) =>
          accumulatedQuantity + cartItem.qty * cartItem.price,
        0
      );
      let totalForGroceries = basket.reduce(
        (accumulatedQuantity, cartItem) =>
          cartItem.subcategory === "groceries" &&
          accumulatedQuantity + cartItem.qty * cartItem.price,
        0
      );

      let totalForDiscount = total - totalForGroceries;
      // console.log({ basket });
      console.log({ total });
      console.log({ totalForGroceries });
      console.log({ totalForDiscount });

      let discount = -0.05;

      if (user.userType.customer) {
        yearsDiff >= 2 &&
          (totalForDiscount = totalForDiscount * 0.95 + discount);
        const bill = totalForDiscount + totalForGroceries;
        return res.status(200).json({ bill });
      } else if (user.userType.employee) {
        totalForDiscount = totalForDiscount * 0.7 + discount;
        const bill = totalForDiscount + totalForGroceries;
        return res.status(200).json({ bill });
      } else if (user.userType.affiliate) {
        totalForDiscount = totalForDiscount * 0.9 + discount;
        const bill = totalForDiscount + totalForGroceries;
        return res.status(200).json({ bill });
      } else {
        const bill = totalForDiscount + totalForGroceries;
        return res.status(200).json({ bill });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
