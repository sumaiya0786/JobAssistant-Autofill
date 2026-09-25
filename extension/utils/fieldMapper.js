const JA_RULES = [

  // =========================
  // PERSONAL
  // =========================

  {
    key: "fullName",

    exact: [
      "name",
      "full name",
      "your name",
      "candidate name",
      "applicant name",
      "name of applicant",
      "complete name",
      "full legal name"
    ],

    any: [
      "full name",
      "your name",
      "candidate name",
      "applicant name",
      "name of applicant"
    ],

    name: [
      "fullname",
      "full_name",
      "name",
      "applicantname",
      "candidatename"
    ],

    autocomplete: ["name"]
  },


  {
    key: "firstName",

    exact: [
      "first name",
      "given name",
      "forename",
      "fname"
    ],

    any: [
      "first name",
      "given name",
      "forename"
    ],

    name: [
      "firstname",
      "first_name",
      "fname",
      "givenname"
    ],

    autocomplete: ["given-name"]
  },


  {
    key: "lastName",

    exact: [
      "last name",
      "surname",
      "family name",
      "lname"
    ],

    any: [
      "last name",
      "surname",
      "family name"
    ],

    name: [
      "lastname",
      "last_name",
      "lname",
      "surname",
      "familyname"
    ],

    autocomplete: ["family-name"]
  },


  {
    key: "email",

    exact: [
      "email",
      "email address",
      "e-mail",
      "e-mail address",
      "professional email"
    ],

    any: [
      "email",
      "e-mail",
      "email address",
      "mail address",
      "professional email"
    ],

    name: [
      "email",
      "e_mail",
      "mail"
    ],

    type: ["email"],

    autocomplete: ["email"]
  },


  {
    key: "phone",

    exact: [
      "phone",
      "phone number",
      "mobile",
      "mobile number",
      "contact number",
      "contact no",
      "telephone",
      "telephone number",
      "cell number"
    ],

    any: [
      "phone",
      "phone number",
      "mobile",
      "mobile number",
      "contact number",
      "contact no",
      "telephone",
      "telephone number",
      "cell"
    ],

    name: [
      "phone",
      "mobile",
      "tel",
      "contact",
      "contactno",
      "phonenumber"
    ],

    type: ["tel"],

    autocomplete: ["tel"]
  },


  {
    key: "dateOfBirth",

    exact: [
      "date of birth",
      "dob",
      "birth date",
      "birthday"
    ],

    any: [
      "date of birth",
      "dob",
      "birth date",
      "birthday"
    ],

    name: [
      "dob",
      "birth"
    ],

    autocomplete: ["bday"]
  },


  // =========================
  // SOCIAL
  // =========================

  {
    key: "linkedin",

    exact: [
      "linkedin",
      "linkedin profile",
      "linkedin url",
      "linkedin link",
      "linkedin profile url"
    ],

    any: [
      "linkedin",
      "linked in"
    ],

    name: [
      "linkedin"
    ],

    strong: [
      "linkedin"
    ]
  },


  {
    key: "github",

    exact: [
      "github",
      "github profile",
      "github url",
      "github link",
      "github profile url",
      "github username"
    ],

    any: [
      "github",
      "git hub"
    ],

    name: [
      "github",
      "git"
    ],

    strong: [
      "github"
    ]
  },


  {
    key: "portfolio",

    exact: [
      "portfolio",
      "portfolio link",
      "portfolio url",
      "personal website",
      "website",
      "personal website url"
    ],

    any: [
      "portfolio",
      "personal website",
      "professional website",
      "portfolio url"
    ],

    name: [
      "portfolio",
      "website"
    ]
  },


  // =========================
  // EDUCATION
  // =========================

  {
    key: "university",

    exact: [
      "university",
      "college",
      "institution",
      "school",
      "alma mater"
    ],

    any: [
      "university",
      "college",
      "institution",
      "school",
      "alma mater"
    ],

    name: [
      "university",
      "college",
      "institution",
      "school"
    ]
  },


  {
    key: "degree",

    exact: [
      "degree",
      "qualification",
      "course",
      "highest qualification"
    ],

    any: [
      "degree",
      "qualification",
      "course"
    ],

    name: [
      "degree",
      "qualification"
    ]
  },


  {
    key: "branch",

    exact: [
      "branch",
      "major",
      "specialization",
      "specialisation",
      "field of study",
      "stream"
    ],

    any: [
      "branch",
      "major",
      "specialization",
      "specialisation",
      "field of study",
      "stream"
    ],

    name: [
      "branch",
      "major",
      "specialization"
    ]
  },


  {
    key: "graduationYear",

    exact: [
      "graduation year",
      "year of graduation",
      "year of passing",
      "passing year",
      "expected graduation year",
      "grad year"
    ],

    any: [
      "graduation year",
      "year of graduation",
      "year of passing",
      "passing year",
      "expected graduation"
    ],

    name: [
      "gradyear",
      "graduation"
    ]
  },


  {
    key: "cgpa",

    exact: [
      "cgpa",
      "gpa",
      "grade point",
      "percentage",
      "marks"
    ],

    any: [
      "cgpa",
      "gpa",
      "grade point",
      "percentage",
      "marks"
    ],

    name: [
      "cgpa",
      "gpa"
    ]
  },


  // =========================
  // ADDRESS
  // =========================

  {
    key: "location",

    exact: [
      "location",
      "current location",
      "present location",
      "where are you based"
    ],

    any: [
      "location",
      "current location",
      "present location",
      "where are you based"
    ],

    name: [
      "location"
    ]
  },


  {
    key: "address",

    exact: [
      "address",
      "street address",
      "residential address",
      "home address"
    ],

    any: [
      "address",
      "street address",
      "residential address",
      "home address"
    ],

    name: [
      "address",
      "street"
    ],

    autocomplete: ["street-address"]
  },


  {
    key: "city",

    exact: [
      "city",
      "town"
    ],

    any: [
      "city",
      "town"
    ],

    name: [
      "city",
      "town"
    ],

    autocomplete: ["address-level2"]
  },


  {
    key: "state",

    exact: [
      "state",
      "province",
      "region"
    ],

    any: [
      "state",
      "province",
      "region"
    ],

    name: [
      "state",
      "province"
    ],

    autocomplete: ["address-level1"]
  },


  {
    key: "country",

    exact: [
      "country",
      "nation"
    ],

    any: [
      "country",
      "nation"
    ],

    name: [
      "country"
    ],

    autocomplete: [
      "country",
      "country-name"
    ]
  },


  {
    key: "pincode",

    exact: [
      "pincode",
      "pin code",
      "zip",
      "zip code",
      "postal code",
      "postcode"
    ],

    any: [
      "pincode",
      "pin code",
      "zip code",
      "postal code",
      "postcode"
    ],

    name: [
      "pincode",
      "zip",
      "postal"
    ],

    autocomplete: ["postal-code"]
  },


  // =========================
  // PROFESSIONAL
  // =========================

  {
    key: "currentRole",

    exact: [
      "current role",
      "current title",
      "current position",
      "current designation",
      "job title"
    ],

    any: [
      "current role",
      "current title",
      "current position",
      "current designation",
      "job title"
    ],

    name: [
      "currentrole",
      "designation"
    ]
  },


  {
    key: "targetRole",

    exact: [
      "desired role",
      "target role",
      "position applying for",
      "role applying for"
    ],

    any: [
      "desired role",
      "target role",
      "position applying",
      "role applying"
    ],

    name: [
      "targetrole"
    ]
  },


  {
    key: "experienceYears",

    exact: [
      "years of experience",
      "total experience",
      "work experience",
      "experience in years",
      "years experience"
    ],

    any: [
      "years of experience",
      "total experience",
      "work experience",
      "experience in years"
    ],

    name: [
      "experience",
      "yoe"
    ]
  },


  {
    key: "skills",

    exact: [
      "skills",
      "key skills",
      "technical skills"
    ],

    any: [
      "skills",
      "key skills",
      "technical skills"
    ],

    name: [
      "skills"
    ]
  },


  // =========================
  // OTHER
  // =========================

  {
    key: "noticePeriod",

    exact: [
      "notice period",
      "availability to join",
      "when can you start"
    ],

    any: [
      "notice period",
      "availability to join",
      "when can you start"
    ],

    name: [
      "notice"
    ]
  },


  {
    key: "workAuthorization",

    exact: [
      "work authorization",
      "authorized to work",
      "visa status",
      "right to work",
      "work permit"
    ],

    any: [
      "work authorization",
      "authorized to work",
      "visa status",
      "right to work",
      "work permit",
      "sponsorship"
    ],

    name: [
      "authorization",
      "visa"
    ]
  },


  {
    key: "willingToRelocate",

    exact: [
      "willing to relocate",
      "open to relocation",
      "willingness to relocate"
    ],

    any: [
      "willing to relocate",
      "open to relocation",
      "relocate",
      "relocation"
    ],

    name: [
      "relocate",
      "relocation"
    ]
  }
];


const JA_SENSITIVE = new Set([
  "workAuthorization",
  "willingToRelocate"
]);


function jaNorm(value) {

  return String(value || "")
    .toLowerCase()
    .replace(/[_\-\/]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function jaCompact(value) {

  return jaNorm(value)
    .replace(/\s+/g, "");
}


function jaScoreRule(rule, ctx) {

  let score = 0;


  // Exact label match = strongest
  if (
    ctx.label &&
    rule.exact?.some(x => ctx.label === jaNorm(x))
  ) {
    score += 150;
  }


  // Exact nearby text
  if (
    ctx.nearby &&
    rule.exact?.some(x => ctx.nearby === jaNorm(x))
  ) {
    score += 100;
  }


  // Phrases in all contextual text
  for (const phrase of rule.any || []) {

    const p = jaNorm(phrase);

    if (ctx.text.includes(p)) {

      score += p.includes(" ")
        ? 65
        : 40;
    }
  }


  // name/id
  for (const n of rule.name || []) {

    const compact = jaCompact(n);

    if (
      compact &&
      ctx.nameId.includes(compact)
    ) {
      score += 50;
    }
  }


  // strong indicators
  for (const s of rule.strong || []) {

    const value = jaNorm(s);

    if (
      ctx.text.includes(value) ||
      ctx.nameId.includes(jaCompact(value))
    ) {
      score += 80;
    }
  }


  // input type
  if (
    rule.type &&
    ctx.type &&
    rule.type.includes(ctx.type)
  ) {
    score += 70;
  }


  // autocomplete
  if (
    rule.autocomplete &&
    ctx.autocomplete &&
    rule.autocomplete.includes(ctx.autocomplete)
  ) {
    score += 100;
  }


  return score;
}


const FieldMapper = {

  map(descriptor = {}) {

    const label =
      jaNorm(descriptor.label);

    const placeholder =
      jaNorm(descriptor.placeholder);

    const ariaLabel =
      jaNorm(descriptor.ariaLabel);

    const nearby =
      jaNorm(descriptor.nearbyText);

    const nameId =
      jaCompact(
        `${descriptor.name || ""} ${descriptor.id || ""}`
      );

    const ctx = {

      label,

      nearby,

      text: [
        label,
        placeholder,
        ariaLabel,
        nearby
      ]
        .filter(Boolean)
        .join(" | "),

      nameId,

      autocomplete:
        jaNorm(descriptor.autocomplete),

      type:
        jaNorm(descriptor.type)
    };


    const scored = JA_RULES
      .map(rule => ({
        key: rule.key,
        score: jaScoreRule(rule, ctx)
      }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);


    if (!scored.length) {

      return {
        fieldKey: null,
        confidence: 0,
        ambiguous: true,
        alternatives: [],
        sensitive: false
      };
    }


    const best = scored[0];
    const second = scored[1];


    // Special handling for generic "Name"
    //
    // "Name" alone means FULL NAME.
    // It should NOT become firstName.
    //
    if (
      label === "name" ||
      label === "your name"
    ) {

      return {
        fieldKey: "fullName",
        confidence: 0.99,
        ambiguous: false,
        alternatives: [],
        sensitive: false
      };
    }


    // First/last name explicit labels
    if (
      [
        "first name",
        "given name",
        "forename",
        "fname"
      ].includes(label)
    ) {

      return {
        fieldKey: "firstName",
        confidence: 0.99,
        ambiguous: false,
        alternatives: [],
        sensitive: false
      };
    }


    if (
      [
        "last name",
        "surname",
        "family name",
        "lname"
      ].includes(label)
    ) {

      return {
        fieldKey: "lastName",
        confidence: 0.99,
        ambiguous: false,
        alternatives: [],
        sensitive: false
      };
    }


    const confidence =
      Math.min(
        0.99,
        best.score / 150
      );


    let ambiguous = false;
    let alternatives = [];


    if (second) {

      const difference =
        best.score - second.score;

      if (difference <= 20) {

        const groups = [

          [
            "linkedin",
            "github",
            "portfolio"
          ],

          [
            "fullName",
            "firstName",
            "lastName"
          ]
        ];

        for (const group of groups) {

          if (
            group.includes(best.key) &&
            group.includes(second.key)
          ) {

            ambiguous = true;

            alternatives = scored
              .filter(x =>
                group.includes(x.key)
              )
              .map(x => x.key);

            break;
          }
        }
      }
    }


    return {

      fieldKey: best.key,

      confidence:
        Math.round(
          confidence * 100
        ) / 100,

      ambiguous:
        ambiguous ||
        confidence < 0.35,

      alternatives,

      sensitive:
        JA_SENSITIVE.has(best.key)
    };
  },


  resolveValue(profile, key) {

    if (!profile || !key) {
      return "";
    }


    const personal =
      profile.personal || {};

    const professional =
      profile.professional || {};

    const education =
      (profile.education || [])[0] || {};

    const other =
      profile.other || {};


    const map = {

      fullName:
        personal.fullName ||
        [
          personal.firstName,
          personal.lastName
        ]
          .filter(Boolean)
          .join(" "),

      firstName:
        personal.firstName ||
        (personal.fullName || "")
          .split(" ")[0],

      lastName:
        personal.lastName ||
        (personal.fullName || "")
          .split(" ")
          .slice(1)
          .join(" "),

      email:
        personal.email || "",

      phone:
        personal.phone || "",

      dateOfBirth:
        personal.dateOfBirth || "",

      location:
        personal.location ||
        [
          personal.city,
          personal.state
        ]
          .filter(Boolean)
          .join(", "),

      address:
        personal.address || "",

      city:
        personal.city || "",

      state:
        personal.state || "",

      country:
        personal.country || "",

      pincode:
        personal.pincode || "",

      currentRole:
        professional.currentRole || "",

      targetRole:
        professional.targetRole || "",

      experienceYears:
        professional.experienceYears || "",

      linkedin:
        professional.linkedin || "",

      github:
        professional.github || "",

      portfolio:
        professional.portfolio || "",

      skills:
        Array.isArray(professional.skills)
          ? professional.skills.join(", ")
          : professional.skills || "",

      university:
        education.university || "",

      degree:
        education.degree || "",

      branch:
        education.branch || "",

      graduationYear:
        education.graduationYear || "",

      cgpa:
        education.cgpa || "",

      noticePeriod:
        other.noticePeriod || "",

      workAuthorization:
        other.workAuthorization || "",

      willingToRelocate:
        other.willingToRelocate || ""
    };


    return map[key] || "";
  },


  label(key) {

    const labels = {

      fullName: "Full Name",
      firstName: "First Name",
      lastName: "Last Name",

      email: "Email",
      phone: "Phone",

      dateOfBirth: "Date of Birth",

      location: "Location",
      address: "Address",
      city: "City",
      state: "State",
      country: "Country",
      pincode: "Pincode",

      currentRole: "Current Role",
      targetRole: "Target Role",
      experienceYears: "Experience",

      linkedin: "LinkedIn",
      github: "GitHub",
      portfolio: "Portfolio",

      skills: "Skills",

      university: "University",
      degree: "Degree",
      branch: "Branch",
      graduationYear: "Graduation Year",
      cgpa: "CGPA",

      noticePeriod: "Notice Period",

      workAuthorization:
        "Work Authorization",

      willingToRelocate:
        "Willing to Relocate"
    };


    return labels[key] || key;
  },


  keys() {
    return JA_RULES.map(
      rule => rule.key
    );
  }
};


if (typeof window !== "undefined") {
  window.JA_FieldMapper = FieldMapper;
}