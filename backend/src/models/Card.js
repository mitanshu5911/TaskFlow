import mongoose from "mongoose";



const attachmentSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
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

    isCompleted: {
  type: Boolean,
  default: false,
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


    attachments: [attachmentSchema],

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Card", cardSchema);