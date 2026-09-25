const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    duration: String,
    responsibilities: String,
  },
  { _id: true }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    technologies: String,
    link: String,
  },
  { _id: true }
);

const EducationSchema = new mongoose.Schema(
  {
    university: String,
    degree: String,
    branch: String,
    graduationYear: String,
    cgpa: String,
  },
  { _id: true }
);

const ProfileSchema = new mongoose.Schema(
  {
    personal: {
      fullName: { type: String, default: "" },
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      dateOfBirth: { type: String, default: "" },
      location: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    professional: {
      currentRole: { type: String, default: "" },
      targetRole: { type: String, default: "" },
      experienceYears: { type: String, default: "" },
      skills: { type: [String], default: [] },
      programmingLanguages: { type: [String], default: [] },
      frameworks: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
    education: { type: [EducationSchema], default: [] },
    schooling: {
      tenthSchool: { type: String, default: "" },
      tenthPercentage: { type: String, default: "" },
      twelfthSchool: { type: String, default: "" },
      twelfthPercentage: { type: String, default: "" },
    },
    experience: { type: [ExperienceSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    other: {
      certifications: { type: [String], default: [] },
      achievements: { type: [String], default: [] },
      preferredLocations: { type: [String], default: [] },
      noticePeriod: { type: String, default: "" },
      workAuthorization: { type: String, default: "" },
      willingToRelocate: { type: String, default: "" },
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    profile: { type: ProfileSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
