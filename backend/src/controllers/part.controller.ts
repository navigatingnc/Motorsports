import { Request, Response } from 'express';
import prisma from '../prisma';
import {
  CreatePartDto,
  UpdatePartDto,
  AdjustQuantityDto,
  VALID_PART_CATEGORIES,
} from '../types/part.types';

// Consistent vehicle select for part responses
const partInclude = {
  vehicle: {
    select: { id: true, make: true, model: true, year: true, number: true },
  },
};

// ---------------------------------------------------------------------------
// GET /api/parts
// ---------------------------------------------------------------------------

/**
 * Retrieve all parts with optional filters:
 *   ?category=Engine
 *   ?vehicleId=<uuid>
 *   ?lowStock=true   (only parts at or below their lowStockThreshold)
 *   ?search=<string> (case-insensitive match on name, partNumber, supplier)
 */
export const getAllParts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, vehicleId, lowStock, search } = req.query as {
      category?: string;
      vehicleId?: string;
      lowStock?: string;
      search?: string;
    };

    // Build Prisma where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (category) where['category'] = category;
    if (vehicleId) where['vehicleId'] = vehicleId;

    if (search) {
      where['OR'] = [
        { name:       { contains: search, mode: 'insensitive' } },
        { partNumber: { contains: search, mode: 'insensitive' } },
        { supplier:   { contains: search, mode: 'insensitive' } },
        { location:   { contains: search, mode: 'insensitive' } },
      ];
    }

    const parts = await prisma.part.findMany({
      where,
      include: partInclude,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Apply lowStock filter in-memory (quantity <= threshold)
    const filtered =
      lowStock === 'true'
        ? parts.filter((p) => p.quantity <= p.lowStockThreshold)
        : parts;

    const enriched = filtered.map((p) => ({
      ...p,
      isLowStock: p.quantity <= p.lowStockThreshold,
    }));

    res.json({
      success: true,
      data: enriched,
      count: enriched.length,
      lowStockCount: enriched.filter((p) => p.isLowStock).length,
    });
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch parts' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/parts/:id
// ---------------------------------------------------------------------------

export const getPartById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const part = await prisma.part.findUnique({ where: { id }, include: partInclude });

    if (!part) {
      res.status(404).json({ success: false, error: 'Part not found' });
      return;
    }

    res.json({
      success: true,
      data: { ...part, isLowStock: part.quantity <= part.lowStockThreshold },
    });
  } catch (error) {
    console.error('Error fetching part:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch part' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/parts
// ---------------------------------------------------------------------------

export const createPart = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreatePartDto = req.body;

    if (!data.name || !data.category) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name and category are required',
      });
      return;
    }

    if (!VALID_PART_CATEGORIES.includes(data.category as (typeof VALID_PART_CATEGORIES)[number])) {
      res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${VALID_PART_CATEGORIES.join(', ')}`,
      });
      return;
    }

    if (data.quantity !== undefined && data.quantity < 0) {
      res.status(400).json({ success: false, error: 'quantity must be 0 or greater' });
      return;
    }

    if (data.cost !== undefined && data.cost < 0) {
      res.status(400).json({ success: false, error: 'cost must be 0 or greater' });
      return;
    }

    if (data.lowStockThreshold !== undefined && data.lowStockThreshold < 0) {
      res.status(400).json({ success: false, error: 'lowStockThreshold must be 0 or greater' });
      return;
    }

    // Verify vehicle exists if provided
    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) {
        res.status(404).json({ success: false, error: 'Vehicle not found' });
        return;
      }
    }

    const part = await prisma.part.create({
      data: {
        name:               data.name,
        partNumber:         data.partNumber ?? null,
        category:           data.category,
        quantity:           data.quantity ?? 0,
        unit:               data.unit ?? 'pcs',
        cost:               data.cost ?? null,
        supplier:           data.supplier ?? null,
        location:           data.location ?? null,
        lowStockThreshold:  data.lowStockThreshold ?? 2,
        notes:              data.notes ?? null,
        vehicleId:          data.vehicleId ?? null,
      },
      include: partInclude,
    });

    res.status(201).json({
      success: true,
      data: { ...part, isLowStock: part.quantity <= part.lowStockThreshold },
      message: 'Part created successfully',
    });
  } catch (error) {
    console.error('Error creating part:', error);
    res.status(500).json({ success: false, error: 'Failed to create part' });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/parts/:id
// ---------------------------------------------------------------------------

export const updatePart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const data: UpdatePartDto = req.body;

    const existing = await prisma.part.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Part not found' });
      return;
    }

    if (
      data.category &&
      !VALID_PART_CATEGORIES.includes(data.category as (typeof VALID_PART_CATEGORIES)[number])
    ) {
      res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${VALID_PART_CATEGORIES.join(', ')}`,
      });
      return;
    }

    if (data.quantity !== undefined && data.quantity < 0) {
      res.status(400).json({ success: false, error: 'quantity must be 0 or greater' });
      return;
    }

    if (data.cost !== undefined && data.cost < 0) {
      res.status(400).json({ success: false, error: 'cost must be 0 or greater' });
      return;
    }

    // Verify vehicle exists if provided (null explicitly clears the relation)
    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) {
        res.status(404).json({ success: false, error: 'Vehicle not found' });
        return;
      }
    }

    const part = await prisma.part.update({
      where: { id },
      data: {
        ...(data.name              !== undefined && { name: data.name }),
        ...(data.partNumber        !== undefined && { partNumber: data.partNumber }),
        ...(data.category          !== undefined && { category: data.category }),
        ...(data.quantity          !== undefined && { quantity: data.quantity }),
        ...(data.unit              !== undefined && { unit: data.unit }),
        ...(data.cost              !== undefined && { cost: data.cost }),
        ...(data.supplier          !== undefined && { supplier: data.supplier }),
        ...(data.location          !== undefined && { location: data.location }),
        ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
        ...(data.notes             !== undefined && { notes: data.notes }),
        ...(data.vehicleId         !== undefined && { vehicleId: data.vehicleId }),
      },
      include: partInclude,
    });

    res.json({
      success: true,
      data: { ...part, isLowStock: part.quantity <= part.lowStockThreshold },
      message: 'Part updated successfully',
    });
  } catch (error) {
    console.error('Error updating part:', error);
    res.status(500).json({ success: false, error: 'Failed to update part' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/parts/:id/adjust
// Adjust quantity by a delta (positive = add, negative = remove)
// ---------------------------------------------------------------------------

export const adjustPartQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { adjustment, notes }: AdjustQuantityDto = req.body;

    if (adjustment === undefined || adjustment === null || typeof adjustment !== 'number') {
      res.status(400).json({
        success: false,
        error: 'adjustment must be a non-zero number (positive to add, negative to remove)',
      });
      return;
    }

    const existing = await prisma.part.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Part not found' });
      return;
    }

    const newQuantity = existing.quantity + adjustment;
    if (newQuantity < 0) {
      res.status(400).json({
        success: false,
        error: `Cannot reduce quantity below 0. Current: ${existing.quantity}, adjustment: ${adjustment}`,
      });
      return;
    }

    const part = await prisma.part.update({
      where: { id },
      data: {
        quantity: newQuantity,
        ...(notes !== undefined && { notes }),
      },
      include: partInclude,
    });

    res.json({
      success: true,
      data: { ...part, isLowStock: part.quantity <= part.lowStockThreshold },
      message: `Quantity adjusted by ${adjustment > 0 ? '+' : ''}${adjustment}. New quantity: ${newQuantity}`,
    });
  } catch (error) {
    console.error('Error adjusting part quantity:', error);
    res.status(500).json({ success: false, error: 'Failed to adjust part quantity' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/parts/:id
// ---------------------------------------------------------------------------

export const deletePart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const existing = await prisma.part.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Part not found' });
      return;
    }

    await prisma.part.delete({ where: { id } });

    res.json({ success: true, message: 'Part deleted successfully' });
  } catch (error) {
    console.error('Error deleting part:', error);
    res.status(500).json({ success: false, error: 'Failed to delete part' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/parts/summary
// Returns inventory summary: total parts, total value, low-stock count, by-category breakdown
// ---------------------------------------------------------------------------

export const getInventorySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const parts = await prisma.part.findMany({ include: partInclude });

    const totalParts = parts.length;
    const totalItems = parts.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = parts.reduce((sum, p) => sum + (p.cost ?? 0) * p.quantity, 0);
    const lowStockParts = parts.filter((p) => p.quantity <= p.lowStockThreshold);

    // By-category breakdown
    const byCategory: Record<string, { count: number; totalItems: number; totalValue: number }> = {};
    for (const p of parts) {
      if (!byCategory[p.category]) {
        byCategory[p.category] = { count: 0, totalItems: 0, totalValue: 0 };
      }
      byCategory[p.category]!.count += 1;
      byCategory[p.category]!.totalItems += p.quantity;
      byCategory[p.category]!.totalValue += (p.cost ?? 0) * p.quantity;
    }

    res.json({
      success: true,
      data: {
        totalParts,
        totalItems,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockCount: lowStockParts.length,
        lowStockParts: lowStockParts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          quantity: p.quantity,
          lowStockThreshold: p.lowStockThreshold,
          unit: p.unit,
        })),
        byCategory: Object.entries(byCategory).map(([category, stats]) => ({
          category,
          ...stats,
          totalValue: Math.round(stats.totalValue * 100) / 100,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory summary' });
  }
};
