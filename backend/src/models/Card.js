import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
  text: String,
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },

    
    order: {
      type: Number,
      required: true,
    },

    
    labels: [
      {
        name: String,
        color: String, 
      },
    ],

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    
    dueDate: {
      type: Date,
    },

    
    checklist: [checklistItemSchema],


    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);

export default Card;