import { BmiCategory, CategoryGuidance, HealthTip, TipTopic } from '../types/health';

export const CATEGORY_GUIDANCE: Record<BmiCategory, CategoryGuidance> = {
  [BmiCategory.Underweight]: {
    category: BmiCategory.Underweight,
    headline: 'Focus on nutrient-dense nourishment and progressive strength',
    explanation:
      'A BMI below 18.5 can leave energy reserves low and affect bone density or immune resilience. Aim for gradual, sustainable weight gain through wholesome calorie-dense foods rather than empty sugars.',
    focusPoints: [
      'Add healthy calorie boosters like olive oil, avocados, nuts, seeds, and Greek yogurt to regular meals.',
      'Eat 5–6 smaller balanced meals throughout the day if large portions feel heavy.',
      'Prioritize resistance training 2–3 times weekly to build lean muscle mass alongside weight gain.',
    ],
  },
  [BmiCategory.Normal]: {
    category: BmiCategory.Normal,
    headline: 'Maintain balance, metabolic fitness, and steady routines',
    explanation:
      'A BMI between 18.5 and 24.9 is associated with lower cardiovascular and metabolic risk. Focus on preserving lean muscle mass, cardiovascular stamina, and consistent daily habits.',
    focusPoints: [
      'Keep meals centered around whole proteins, colorful vegetables, fiber-rich grains, and healthy fats.',
      'Combine 150 minutes of moderate aerobic movement with at least two strength sessions each week.',
      'Track weight weekly rather than obsessing over normal day-to-day water fluctuations.',
    ],
  },
  [BmiCategory.Overweight]: {
    category: BmiCategory.Overweight,
    headline: 'Build a gentle, sustainable calorie deficit and daily movement',
    explanation:
      'A BMI between 25.0 and 29.9 suggests modest excess weight. Small, steady changes—such as increasing daily step counts and protein intake—deliver far better long-term results than crash dieting.',
    focusPoints: [
      'Aim for a gradual pace of 0.25–0.5 kg per week with balanced, high-satiety meals.',
      'Fill half your plate with high-fiber vegetables and include lean protein at every meal to stay full.',
      'Replace sugary beverages with water or unsweetened tea, and add a 20–30 minute brisk walk daily.',
    ],
  },
  [BmiCategory.Obesity]: {
    category: BmiCategory.Obesity,
    headline: 'Prioritize low-impact consistency and supportive clinical care',
    explanation:
      'A BMI of 30.0 or higher can increase strain on joints, sleep quality, and cardiovascular health. Focus on low-impact activity, structured meals, and partnering with a healthcare provider for a tailored plan.',
    focusPoints: [
      'Start with joint-friendly movement like walking, swimming, cycling, or water aerobics.',
      'Focus on whole, minimally processed foods and regular meal timing to stabilize appetite hormones.',
      'Celebrate non-scale milestones such as improved stamina, better sleep, and lower resting heart rate.',
    ],
  },
};

export const HEALTH_TIPS: HealthTip[] = [
  {
    id: 'hyd-1',
    topic: TipTopic.Hydration,
    title: 'Morning Hydration Reset',
    description:
      'Drink 300–500 ml of water shortly after waking to rehydrate after sleep and support alertness before caffeine.',
    actionableTarget: '1 full glass upon waking',
  },
  {
    id: 'hyd-2',
    topic: TipTopic.Hydration,
    title: 'Pre-Meal Water Habit',
    description:
      'Sipping a glass of water 20 minutes before meals aids digestion and helps distinguish true hunger from mild thirst.',
    actionableTarget: '250 ml before main meals',
  },
  {
    id: 'nut-1',
    topic: TipTopic.Nutrition,
    title: 'Protein-First Meal Anchoring',
    description:
      'Including 20–30 g of quality protein (eggs, fish, poultry, tofu, lentils) in each meal supports muscle retention and steady satiety.',
    actionableTarget: '20–30 g protein per meal',
  },
  {
    id: 'nut-2',
    topic: TipTopic.Nutrition,
    title: 'Fiber & Color Diversity',
    description:
      'Aim for a mix of leafy greens, berries, legumes, and whole grains to nourish gut health and smooth blood sugar responses.',
    actionableTarget: '25–35 g dietary fiber daily',
  },
  {
    id: 'exe-1',
    topic: TipTopic.Exercise,
    title: 'Weekly Aerobic Foundation',
    description:
      'Brisk walking, cycling, or swimming boosts heart health, insulin sensitivity, and daily energy expenditure without excessive fatigue.',
    actionableTarget: '150 min moderate cardio / week',
  },
  {
    id: 'exe-2',
    topic: TipTopic.Exercise,
    title: 'Twice-Weekly Resistance Training',
    description:
      'Bodyweight exercises, resistance bands, or weights preserve lean tissue and keep resting metabolism resilient as weight changes.',
    actionableTarget: '2–3 strength sessions / week',
  },
  {
    id: 'lif-1',
    topic: TipTopic.Lifestyle,
    title: 'Consistent Weigh-In Conditions',
    description:
      'Weigh yourself at the same time—ideally in the morning after using the restroom and before breakfast—to minimize hydration noise.',
    actionableTarget: 'Same time & scale',
  },
  {
    id: 'lif-2',
    topic: TipTopic.Lifestyle,
    title: 'Restorative Sleep Window',
    description:
      'Sleeping fewer than 7 hours increases ghrelin (hunger hormone) and cravings. Protecting a consistent bedtime helps weight regulation.',
    actionableTarget: '7–9 hours nightly',
  },
];
