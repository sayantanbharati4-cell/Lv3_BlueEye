import mongoose from "mongoose";

const durationSchema = new mongoose.Schema({ min: Number, max: Number }, { _id: false });
const teamMembersSchema = new mongoose.Schema({ min: Number, max: Number }, { _id: false });
const locationSchema = new mongoose.Schema({
  city: String, state: String, country: { type: String, default: "India" }
}, { _id: false });
const performanceSchema = new mongoose.Schema({
  duration_minutes: durationSchema,
  team_members: teamMembersSchema,
  genres: [String],
  languages: [String]
}, { _id: false });
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });
const mediaSchema = new mongoose.Schema({
  videos: { type: [String], validate: { validator: (v: string[]) => v.length > 0, message: "At least one video URL is required" } },
  images: { type: [String], validate: { validator: (v: string[]) => v.length > 0, message: "At least one image is required" } },
}, { _id: false });

const artistApplicantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  category_tag: String,
  location: locationSchema,
  performance: performanceSchema,
  booking_link: String,
  about: mongoose.Schema.Types.Mixed,
  faq: [faqSchema],
  media: { type: mediaSchema, required: true },
  applicantEmail: { type: String, required: true, trim: true, lowercase: true },
  applicantPhone: { type: String, required: true, trim: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  rejectedAt: Date,
}, { timestamps: true, versionKey: false });

artistApplicantSchema.index({ status: 1, createdAt: -1 });
artistApplicantSchema.index({ applicantEmail: 1, status: 1 });
artistApplicantSchema.index({ rejectedAt: 1 }, { expireAfterSeconds: 604800 });

const collectionName = process.env.MONGODB_DB_APPLICANTS_COLLECTION_NAME || "artistapplicants";

const ArtistApplicant = mongoose.models.ArtistApplicant || mongoose.model("ArtistApplicant", artistApplicantSchema, collectionName);

export default ArtistApplicant;
