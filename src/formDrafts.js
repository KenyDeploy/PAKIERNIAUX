// Compare editable form values, not HTML input number/string representations.
export function formSignature(value) {
  const canonical = item => Array.isArray(item) ? item.map(canonical) : item && typeof item === "object"
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, canonical(item[key])]))
    : item == null ? "" : String(item);
  return JSON.stringify(canonical(value));
}
export const formChanged = (initial, draft) => formSignature(initial) !== formSignature(draft);

export function planFormValues(plan, exercises) {
  return { name: plan.name ?? "", days: plan.days ?? "", exercises: plan.exercises,
    targets: Object.fromEntries(plan.exercises.map(id => {
      const exercise = exercises.find(item => item.id === id);
      return [id, Object.fromEntries([["sets",3],["reps",10],["rest",90]].map(([key,fallback]) => [key, plan.targets?.[id]?.[key] ?? exercise?.[key] ?? fallback]))];
    })) };
}

export function newPlanDraft(plans, exercises, now = Date.now()) {
  let id = now;
  while (plans.some(plan => plan.id === id)) id++;
  return { id, name: `Nowy plan ${plans.length + 1}`, days: "Do ustawienia", duration: "30 min", exercises: exercises[0] ? [exercises[0].id] : [], color: "blue" };
}

export function savePlanDraft(data, draft, expected) {
  const plan = { ...draft, name: draft.name || expected?.name || "Nowy plan", days: draft.days || "Do ustawienia", targets: draft.targets || {} };
  const index = data.plans.findIndex(item => item.id === draft.id);
  if (expected == null) {
    if (index >= 0) {
      if (JSON.stringify(data.plans[index]) === JSON.stringify(plan)) return data;
      throw new Error("Plan o tym identyfikatorze już istnieje. Otwórz formularz ponownie.");
    }
    return { ...data, plans: [...data.plans, plan] };
  }
  if (index < 0 || JSON.stringify(data.plans[index]) !== JSON.stringify(expected)) throw new Error("Plan zmienił się. Zachowaj wpisy i otwórz aktualny plan przed zapisem.");
  return { ...data, plans: data.plans.map((item, i) => i === index ? plan : item) };
}
