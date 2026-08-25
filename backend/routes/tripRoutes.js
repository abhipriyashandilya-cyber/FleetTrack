const express = require("express");

const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  updateTripStatus,
  deleteTrip
} = require("../controllers/tripController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All trip routes require authentication
router.use(protect);

// View trips
router
  .route("/")
  .get(getTrips)
  .post(
    authorize("admin", "manager"),
    createTrip
  );

// Individual trip
router
  .route("/:id")
  .get(getTripById)
  .put(
    authorize("admin", "manager"),
    updateTrip
  )
  .delete(
    authorize("admin"),
    deleteTrip
  );

// Update trip status
router.patch(
  "/:id/status",
  updateTripStatus
);

module.exports = router;