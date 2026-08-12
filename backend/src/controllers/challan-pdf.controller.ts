import { Request, Response } from 'express';
import { getChallanByIdService } from '../services/challan.service';
import { generateChallanPdf } from '../services/pdf.service';

/**
 * GET /api/challans/:id/pdf
 * Generates and streams a PDF invoice for the given challan.
 */
export const downloadChallanPdfController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idStr, 10);

  // Reuse existing service to fetch full challan data
  const challan = await getChallanByIdService(id);

  // Set response headers for PDF download
  const filename = `${challan.challanNumber}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Generate and pipe the PDF directly to the response
  const pdfDoc = generateChallanPdf(challan);
  pdfDoc.pipe(res);
};
