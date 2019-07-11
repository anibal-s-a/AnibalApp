const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    city : String,
    address : String,
    typeLocation : String,
    invites: [{ type: Schema.Types.ObjectId, ref: "User" }],
    email: String,
    date: Date,
    time: String,
    alternatives : [{ type: Schema.Types.ObjectId, ref: "Alternative" }],
    location: {
      type: {type:String},
      coordinates: [Number]
    },
    status: {
      type: String,
      enum: ["Pending Vote", "Vote Passed","Vote Failed"],
      default: "Pending Vote"
    },
    confirmationCode: { type: String , unique: true },
    email: [String]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }


);

const Plan = mongoose.model("Plan", planSchema);
module.exports = Plan;