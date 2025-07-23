import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
const router = Router();

// Apply JWT middleware to all routes in this router
router.use(authenticateJWT);

// GET /api/blueprints - List all blueprints
router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('blueprints').select('*').order('name', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/blueprints/:id - Get a single blueprint
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('blueprints').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// POST /api/blueprints - Create a new blueprint
router.post('/', async (req: Request, res: Response) => {
  const blueprint = req.body;
  const { data, error } = await supabase.from('blueprints').insert([blueprint]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PUT /api/blueprints/:id - Update a blueprint (optional)
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase.from('blueprints').update(updates).eq('id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

export default router; 