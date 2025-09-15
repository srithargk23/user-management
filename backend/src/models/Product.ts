import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  image?: string;
  category: Schema.Types.ObjectId;
}

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
   category: {
      type: Schema.Types.ObjectId,
      ref: "Category", 
      required: true,
    },
});

export default model<IProduct>("Product", productSchema);
