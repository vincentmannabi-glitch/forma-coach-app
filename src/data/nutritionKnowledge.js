/**
 * Static nutrition / food / supplement / cooking knowledge for chat.
 * Supplements: balanced potential benefits + limitations/risks; no hype language; no dosages.
 * FORMA Coach does not recommend specific supplements or dosages (see SUPPLEMENT_CLOSING_LINE).
 */

export const MOVEMENT_PATTERNS_EXPLAINED = {
  intro: `The big patterns are: squat (knees and hips bend together), hinge (hips push back with a relatively fixed knee angle), push (extend elbows away from torso), pull (bring resistance toward you), carry (walk under load), rotate/chop (torso turns with control), and brace (midsection resists movement). Programs group them so you train the whole body without overusing one joint. Getting strong in one pattern often helps another — e.g. a better hinge supports a safer deadlift and squat.`,

  push: `Push patterns train chest, shoulders, and triceps (horizontal and vertical angles). Balancing them with pulls keeps shoulders happier.`,

  pull: `Pull patterns train back and biceps; vertical pulls emphasize lats, horizontal pulls emphasize mid-back thickness.`,

  hinge: `Hinge patterns load hamstrings and glutes while the spine stays neutral — different from squatting where knees travel more forward.`,

  squat: `Squat patterns load quads and glutes through deep knee flexion with an upright-ish torso (depending on variation).`,

  carry: `Carries build grip, core, and hips under walking load — very “real world.”`,

  rotate: `Rotation and anti-rotation (Pallof, chops) train obliques and protect the spine during sports and daily life.`,

  brace: `Bracing is co-contracting abs and breathing so the spine stays stable under load — it underlies every heavy lift.`,
}

/** g protein per 100g cooked unless noted */
export const FOOD_PROTEIN = {
  'chicken breast': { per100g: 31, servingG: 150, servingProtein: 46, note: 'Skinless, cooked; values vary with cooking method.' },
  'chicken thigh': { per100g: 26, servingG: 120, servingProtein: 31, note: 'Dark meat; slightly higher fat than breast.' },
  'salmon': { per100g: 25, servingG: 150, servingProtein: 38, note: 'Atlantic farmed vs wild can differ in fat.' },
  'tuna canned': { per100g: 24, servingG: 100, servingProtein: 24, note: 'Drained; water vs oil-packed changes calories.' },
  'egg': { per100g: 13, servingG: 50, servingProtein: 6, note: '~6 g protein per large egg.' },
  'greek yogurt nonfat': { per100g: 10, servingG: 170, servingProtein: 17, note: 'Check label — brands vary.' },
  'cottage cheese lowfat': { per100g: 11, servingG: 150, servingProtein: 17, note: '' },
  'tofu firm': { per100g: 8, servingG: 150, servingProtein: 12, note: '' },
  'lentils cooked': { per100g: 9, servingG: 200, servingProtein: 18, note: 'Also high fibre — great for satiety.' },
  'oats dry': { per100g: 13, servingG: 40, servingProtein: 5, note: 'Per dry scoop; cooked volume differs.' },
}

/** Appended to every supplement-related coach reply — no exceptions. */
export const SUPPLEMENT_CLOSING_LINE = `We always recommend speaking to your doctor or a registered dietitian before starting any supplement. What works for one person may not be right for another. FORMA Coach does not recommend specific supplements or dosages.`

/** Food-focused omega-3 info (no supplement dosing). For pill questions, use SUPPLEMENTS.omega3 + SUPPLEMENT_CLOSING_LINE. */
export const OMEGA3_RICH = `EPA and DHA mainly come from fatty fish (salmon, mackerel, sardines, herring). Plant ALA comes from flax, chia, and walnuts — the body only converts part of ALA to EPA/DHA. How much you get from a meal depends on the fish, portion, and cooking — check reliable food tables if you need detail for planning meals.`

export const CONCEPTS = {
  calories_in_out: `Energy balance: if you eat more calories than you burn over time, weight trends up; less, it trends down. “Calories in vs out” is not about ignoring food quality — it is the accounting frame. Precision is never perfect; trends matter.`,

  deficit: `A calorie deficit means you eat fewer calories than you burn. Common sustainable deficits are often discussed around ~10–20% below maintenance or ~300–500 kcal/day for many adults, but the right size depends on size, activity, stress, sleep, and history. Aggressive deficits can increase fatigue and muscle loss risk — especially without enough protein and strength training.`,

  surplus: `A surplus means you eat more than you burn. For muscle building, a modest surplus (often discussed in the ~5–15% above maintenance range in sport literature, highly individual) can support strength gains while limiting excess fat gain — paired with progressive overload and adequate protein.`,

  macros: `Macronutrients: protein (4 kcal/g), carbs (4 kcal/g), fat (9 kcal/g). Protein supports muscle repair and satiety; carbs fuel hard training; fats support hormones and nutrient absorption. Ratios matter less than totals and consistency for most people.`,

  tef: `Thermic effect of food (TEF) is the energy used to digest and process food — protein tends to have a higher TEF than fat or carbs, but TEF is still a modest slice of daily burn. It does not override energy balance.`,

  insulin: `Insulin helps regulate blood sugar and storage. Carbs raise insulin more than protein or fat, but insulin is not “good” or “bad” — it is a normal hormone. Body composition still comes down to long-term energy balance, protein, training, and sleep — not single spikes from oats or fruit.`,

  mps: `Muscle protein synthesis (MPS) is the process of building muscle protein. Training + protein across the day stimulates MPS; long gaps without protein or very low calorie intake can blunt recovery. Spreading protein across meals often works well — not because “anabolic windows” are magic, but because total daily protein matters.`,
}

export const SUPPLEMENTS = {
  creatine: `Potential benefits — research suggests creatine may support strength and power output in some people. Limitations and risks — it does not work the same way for everyone; some people see no benefit. It can cause water retention and temporary weight gain. People with kidney conditions should speak to their doctor before using it. Long-term safety in certain populations is not fully established. Always consult your doctor first.`,

  protein_powder: `Potential benefits — a convenient way to increase protein intake when whole-food sources are not practical. Limitations and risks — it is not a whole food and lacks the full nutritional profile of real food. Some products contain additives, sweeteners, and lower-quality protein sources. Excess protein beyond what the body needs does not build more muscle; it is just extra calories. People with kidney conditions should be cautious with high protein intake. Always read ingredients and choose products with minimal additives.`,

  caffeine: `Potential benefits — caffeine has been studied for alertness, endurance, and perceived exertion in some contexts. Limitations and risks — sensitivity varies widely; it can disrupt sleep, raise heart rate, and worsen anxiety in some people. It interacts with medications and conditions (including heart rhythm issues). Habituation is common. It is not a substitute for sleep or recovery. What feels fine for one person can be too much for another.`,

  omega3: `Potential benefits — research suggests omega-3 fatty acids may support heart health, brain function, and may play a role in inflammation. Limitations and risks — high intakes can affect blood clotting, which matters for people on blood thinners or before surgery. Quality varies enormously between products. Whole-food sources like fatty fish are preferable where possible. Individual response and medication interactions are not predictable from general research alone.`,

  vitamin_d: `Potential benefits — correcting a genuine vitamin D shortfall can matter for bone health, immune function, and other roles research continues to study. Limitations and risks — more is not better; vitamin D is fat-soluble and can accumulate. Supplementing without knowing your levels can be wasteful at best and harmful at worst. It interacts with other health factors and medications. Always get tested before supplementing and follow your doctor’s guidance.`,

  magnesium: `Potential benefits — correcting low magnesium intake may support muscle and nerve function, blood pressure, and other roles in people who actually need more. Limitations and risks — supplement forms differ in absorption and side effects (for example digestive upset). Kidney disease changes how the body handles magnesium. “More” is not automatically helpful. Food sources include leafy greens, nuts, beans, and whole grains; whether pills are appropriate belongs with your clinician.`,

  bcaa: `Potential benefits — some research suggests BCAAs may reduce muscle soreness in some settings. Limitations and risks — if you already eat enough protein from whole foods, BCAAs often provide little to no additional benefit. The research is mixed, and many studies show no clear advantage over simply eating adequate complete protein. They are largely unnecessary if your diet is complete.`,

  preworkout: `Potential benefits — some people report improved focus and energy during training from caffeine-containing products. Limitations and risks — many pre-workouts contain very high amounts of caffeine, which can contribute to heart palpitations, anxiety, elevated blood pressure, disrupted sleep, and dependency. Some contain ingredients with limited research or safety data. They are not appropriate for people with heart conditions, anxiety disorders, or high blood pressure, and are not recommended for anyone under 18. The “crash” afterward can be significant. You can get a caffeine effect from a cup of coffee with far less formulation risk — though caffeine still has its own limits and interactions.`,

  zinc: `Potential benefits — correcting true zinc deficiency can support immune function, wound healing, and many enzyme systems. Limitations and risks — excess zinc from supplements can interfere with copper absorption and cause side effects. Supplementing without a reason can be unnecessary or harmful. Your doctor can assess whether testing or supplementation makes sense for you.`,

  melatonin: `Potential benefits — research suggests melatonin may help with sleep onset in some situations, such as jet lag or shift work. Limitations and risks — it is a hormone, not a casual “sleep vitamin.” Long-term effects of regular use are not fully understood. It can cause grogginess, headaches, and dizziness. It does not fix the root cause of chronic poor sleep. Always speak to your doctor before using it regularly, especially if you take other medications or have a health condition.`,

  vitamins_minerals: `Potential benefits — correcting a genuine deficiency can have meaningful health benefits. Limitations and risks — more is not better. Fat-soluble vitamins (A, D, E, and K) can accumulate to harmful levels if over-supplemented. Water-soluble vitamins are generally safer in excess but still have upper limits and interactions. Supplementing without knowing your levels can be wasteful at best and harmful at worst. Always get tested where appropriate and follow your doctor’s guidance.`,

  multivitamin: `Potential benefits — in theory, a multivitamin can help fill gaps when diet is inconsistent; correcting real deficiencies matters. Limitations and risks — routine multivitamins are not a substitute for a varied diet, and they can provide nutrients you do not need alongside ones you might. Quality and formulations vary. The same “more is not better” and interaction concerns apply as with any vitamin–mineral supplement. Needs depend on diet, age, pregnancy, absorption, and medications — not a one-size-fits-all pill.`,

  iron: `Potential benefits — treating documented iron deficiency can improve energy, exercise tolerance, and health outcomes when a clinician confirms the problem. Limitations and risks — excess iron is harmful and interacts with many conditions and medications. Taking iron without a confirmed need can mask other problems or cause overload. Testing and ongoing oversight belong with your doctor.`,

  b12: `Potential benefits — correcting B12 deficiency can support nerve health, blood cell formation, and energy in people who are actually low. Limitations and risks — needs vary by diet (including plant-based patterns), age, and absorption issues; high doses are not automatically “extra helpful” and can complicate interpretation of tests. Forms and routes (food, oral, injection) are medical decisions. Your doctor can interpret symptoms and labs in context.`,

  generic: `Research on supplements is uneven: some ingredients have more human data than others, and results often do not apply to everyone. Potential benefits in studies are not promises for you personally. There are always trade-offs — side effects, interactions, cost, and unknown long-term use for some products. We will not hype any product or present it as risk-free. Use balanced information to prepare questions for your doctor or registered dietitian, not to self-prescribe.`,
}

export const COOKING = {
  chicken_done: `Chicken is safe when cooked through with no pink at the center and juices run clear — best is using a meat thermometer: 74°C / 165°F at the thickest part. For thighs, same temp; rest a few minutes so juices settle.`,

  yogurt_sub: `Greek yogurt often substitutes for sour cream (tangier, higher protein). Full-fat yogurt can match creaminess better. For baking, yogurt adds moisture — watch acidity.`,

  dairy_free: `Dairy-free swaps: coconut cream/cream cheese for richness, plant milks (watch protein content), nutritional yeast for cheesy flavor, oil or plant butter for fat.`,

  salmon_sub: `For salmon in a recipe: other fish (trout, cod for milder), tofu or tempeh for plant protein, or chicken if you want lean meat — adjust cook time.`,
}
