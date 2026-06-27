export type Lang = "en" | "hi";

export const t = {
  en: {
    appName: "MindGarden",
    appNameAccent: "AI Wellness",
    tagline: "A quiet space to reflect, gently.",
    langToggleLabel: "Language",
    english: "EN",
    hindi: "हिं",
    contextTitle: "Your context (optional)",
    contextHint: "Helps tailor your reflection. Stays on this device.",
    name: "Name",
    role: "Role or life stage",
    focus: "Current focus",
    namePh: "e.g. Anika",
    rolePh: "e.g. student, designer, parent",
    focusPh: "e.g. exam prep, job switch",
    showContext: "Add context",
    hideContext: "Hide context",
    journalLabel: "What's on your mind?",
    journalPh: "Write freely. No one is reading but you.",
    analyze: "Analyze My Thoughts",
    analyzing: "Listening to your words…",
    reflection: "Your Reflection",
    card1: "Triggers",
    card2: "A gentle reminder",
    card3: "One small step",
    noTrigger: "General Reflection",
    triggers: {
      pressure: "Performance Pressure",
      burnout: "Burnout Signals",
      lonely: "Social Disconnect",
      future: "Future Uncertainty",
      sleep: "Rest Deficit",
      money: "Financial Worry",
      relationship: "Relationship Strain",
    },
    reassuranceWithAll: (n: string, r: string, f: string) =>
      `${n}, your focus on ${f} is a chapter, not the whole story. The work you're putting in as a ${r} matters — even when progress feels invisible.`,
    reassuranceWithName: (n: string) =>
      `${n}, what you're feeling is information, not a verdict. You are allowed to move at a human pace.`,
    reassuranceGeneric:
      "What you're feeling is information, not a verdict. You are allowed to move at a human pace, and to begin again as often as you need.",
    coping: {
      low: "Place both feet on the floor. Take three slow breaths and name one thing you can see, hear, and touch.",
      mid: "Step away from the screen for five minutes. Stretch, walk to a window, or play one song you love.",
      high: "High stress detected. Close the laptop. Take a 5-minute break — dance to an upbeat song or read a chapter of a book you enjoy.",
    },
    footer:
      "If you are in crisis, please reach out. iCall +91 9152987821 · Vandrevala Foundation 1860-2662-345 (24/7, free).",
    welcome: "Welcome back.",
    greet: (n: string) => `Hello, ${n}.`,
  },
  hi: {
    appName: "माइंडगार्डन",
    appNameAccent: "एआई वेलनेस",
    tagline: "धीरे से सोचने के लिए एक शांत जगह।",
    langToggleLabel: "भाषा",
    english: "EN",
    hindi: "हिं",
    contextTitle: "आपका संदर्भ (वैकल्पिक)",
    contextHint: "आपके चिंतन को बेहतर बनाने में मदद करता है। इसी डिवाइस पर रहता है।",
    name: "नाम",
    role: "भूमिका या जीवन-स्थिति",
    focus: "वर्तमान केंद्र",
    namePh: "जैसे, अनिका",
    rolePh: "जैसे, छात्र, डिज़ाइनर, अभिभावक",
    focusPh: "जैसे, परीक्षा की तैयारी, नौकरी बदलना",
    showContext: "संदर्भ जोड़ें",
    hideContext: "संदर्भ छिपाएँ",
    journalLabel: "आपके मन में क्या है?",
    journalPh: "खुलकर लिखें। यहाँ कोई और नहीं पढ़ रहा।",
    analyze: "मेरे विचार समझें",
    analyzing: "आपके शब्दों को सुन रहे हैं…",
    reflection: "आपका चिंतन",
    card1: "ट्रिगर",
    card2: "एक कोमल याद",
    card3: "एक छोटा कदम",
    noTrigger: "सामान्य चिंतन",
    triggers: {
      pressure: "प्रदर्शन का दबाव",
      burnout: "थकान के संकेत",
      lonely: "सामाजिक दूरी",
      future: "भविष्य की अनिश्चितता",
      sleep: "नींद की कमी",
      money: "आर्थिक चिंता",
      relationship: "रिश्तों का तनाव",
    },
    reassuranceWithAll: (n: string, r: string, f: string) =>
      `${n}, ${f} पर आपका ध्यान एक अध्याय है, पूरी कहानी नहीं। एक ${r} के रूप में आप जो मेहनत कर रहे हैं वह मायने रखती है — भले ही प्रगति दिखाई न दे।`,
    reassuranceWithName: (n: string) =>
      `${n}, जो आप महसूस कर रहे हैं वह जानकारी है, फैसला नहीं। आप इंसानी रफ़्तार से चल सकते हैं।`,
    reassuranceGeneric:
      "जो आप महसूस कर रहे हैं वह जानकारी है, फैसला नहीं। आप इंसानी रफ़्तार से चल सकते हैं, और जितनी बार चाहें फिर से शुरुआत कर सकते हैं।",
    coping: {
      low: "दोनों पैर ज़मीन पर रखें। तीन गहरी साँसें लें और एक-एक चीज़ बताएँ जो आप देख, सुन और छू सकते हैं।",
      mid: "पाँच मिनट के लिए स्क्रीन से दूर हटें। थोड़ा स्ट्रेच करें, खिड़की तक चलें, या अपना पसंदीदा गाना सुनें।",
      high: "तनाव अधिक है। लैपटॉप बंद करें। 5 मिनट का विराम लें — किसी जोशीले गाने पर थिरकें या पसंदीदा किताब का एक अध्याय पढ़ें।",
    },
    footer:
      "यदि आप संकट में हैं, कृपया संपर्क करें। iCall +91 9152987821 · वंद्रेवाला फ़ाउंडेशन 1860-2662-345 (24/7, निःशुल्क)।",
    welcome: "वापसी पर स्वागत है।",
    greet: (n: string) => `नमस्ते, ${n}.`,
  },
} as const;

export type TriggerKey = keyof (typeof t)["en"]["triggers"];

export const triggerKeywords: Record<TriggerKey, string[]> = {
  pressure: ["exam", "score", "deadline", "marks", "test", "interview", "rank", "result", "परीक्षा", "अंक", "नतीजा"],
  burnout: ["tired", "exhausted", "burnout", "overwhelmed", "drained", "can't", "थक", "थका", "थकान"],
  lonely: ["lonely", "alone", "isolated", "nobody", "अकेला", "अकेली", "अकेलापन"],
  future: ["future", "career", "what if", "purpose", "lost", "भविष्य", "करियर"],
  sleep: ["sleep", "insomnia", "awake", "tired", "नींद", "जाग"],
  money: ["money", "rent", "salary", "bills", "afford", "पैसा", "किराया", "वेतन"],
  relationship: ["fight", "family", "partner", "friend", "argument", "झगड़ा", "परिवार", "रिश्ता"],
};