export interface ActionResult {
  error?: string;
  success?: boolean;
  productId?: string;
  brandId?: string;
  categoryId?: string;
}

export interface ImportResult {
  error?: string;
  success?: boolean;
  imported?: number;
  skipped?: number;
  details?: string[];
}
