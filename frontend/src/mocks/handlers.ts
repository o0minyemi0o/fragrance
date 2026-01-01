import { http, HttpResponse, delay } from 'msw';
import { mockAccords, mockFormulas, mockAccordDetail, mockFormulaDetail } from './libraryMockData';
import { mockIngredients, mockIngredientDetail } from './ingredientMockData';
import { mockAccordResult, mockFormulaResult } from './formulationMockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const handlers = [
  // List accords
  http.get(`${API_URL}/api/accords`, async () => {
    await delay(500);
    return HttpResponse.json({ accords: mockAccords });
  }),

  // List formulas
  http.get(`${API_URL}/api/formulas`, async () => {
    await delay(500);
    return HttpResponse.json({ formulas: mockFormulas });
  }),

  // Get accord detail
  http.get(`${API_URL}/api/accords/:id`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json(mockAccordDetail);
  }),

  // Get formula detail
  http.get(`${API_URL}/api/formulas/:id`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json(mockFormulaDetail);
  }),

  // List ingredients
  http.get(`${API_URL}/api/ingredients`, async () => {
    await delay(500);
    return HttpResponse.json(mockIngredients);
  }),

  // Get ingredient detail
  http.get(`${API_URL}/api/ingredients/:id`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json(mockIngredientDetail);
  }),

  // Generate accord
  http.post(`${API_URL}/api/generate/accord`, async () => {
    await delay(2000);
    return HttpResponse.json(mockAccordResult);
  }),

  // Generate formula
  http.post(`${API_URL}/api/generate/formula`, async () => {
    await delay(2000);
    return HttpResponse.json(mockFormulaResult);
  }),

  // Update ingredient ownership
  http.patch(`${API_URL}/api/ingredients/:id/owned`, async ({ request }) => {
    const body = await request.json();
    await delay(200);
    return HttpResponse.json({ success: true, owned: body.owned });
  }),

  // Add ingredient
  http.post(`${API_URL}/api/ingredients`, async ({ request }) => {
    const body = await request.json();
    await delay(1000);
    return HttpResponse.json({ success: true, id: Date.now(), ...body });
  }),

  // Delete accord
  http.delete(`${API_URL}/api/accords/:id`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true });
  }),

  // Delete formula
  http.delete(`${API_URL}/api/formulas/:id`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true });
  }),

  // Update accord
  http.put(`${API_URL}/api/accords/:id`, async ({ request }) => {
    const body = await request.json();
    await delay(500);
    return HttpResponse.json({ success: true, ...body });
  }),

  // Update formula
  http.put(`${API_URL}/api/formulas/:id`, async ({ request }) => {
    const body = await request.json();
    await delay(500);
    return HttpResponse.json({ success: true, ...body });
  }),
];
