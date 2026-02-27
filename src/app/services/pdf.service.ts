import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Order, Payment } from '../models/order.model';
import { Configuration } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  generateInvoice(order: Order, config: Configuration): void {
    const doc = new jsPDF();

    let y = 14;

    // Header
    doc.setFontSize(14);
    doc.text(config.company.name, 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`NIF: ${config.company.nif || '-'}`, 14, y);
    y += 5;
    doc.text(`Maputo: ${config.company.addressMaputo}`, 14, y);
    y += 5;
    doc.text(`Joanesburgo: ${config.company.addressJHB}`, 14, y);
    y += 5;
    doc.text(`Contactos: ${config.company.phoneMZ} | ${config.company.phoneSA}`, 14, y);
    y += 5;
    doc.text(`Email: ${config.company.email}`, 14, y);

    // Invoice meta
    y += 10;
    doc.setFontSize(12);
    doc.text('FACTURA', 105, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.text(`Nº: ${order.orderNumber}`, 14, y);
    doc.text(`Data: ${new Date(order.registrationDate).toLocaleDateString()}`, 105, y);

    // Customer
    y += 8;
    doc.setFontSize(11);
    doc.text('Cliente', 14, y);
    y += 5;
    doc.setFontSize(10);
    doc.text(`Nome: ${order.customerName}`, 14, y);
    y += 5;
    doc.text(`Telefone: ${order.customerPhone}`, 14, y);
    y += 5;
    if (order.deliveryAddress) {
      doc.text(`Endereço: ${order.deliveryAddress}`, 14, y);
      y += 5;
    }

    // Table header
    y += 5;
    doc.setFontSize(10);
    doc.text('Produto', 14, y);
    doc.text('Loja', 80, y);
    doc.text('Qtd', 130, y);
    doc.text('Valor ZAR', 145, y);
    y += 3;
    doc.line(14, y, 196, y);
    y += 5;

    // Products
    order.products.forEach(p => {
      doc.text(this.truncate(p.name, 30), 14, y);
      doc.text(this.truncate(p.store, 18), 80, y);
      doc.text(String(p.quantity), 130, y, { align: 'right' });
      doc.text(`${(p.valueZAR * p.quantity).toFixed(2)}`, 190, y, { align: 'right' });
      y += 5;
    });

    // Totals
    y += 4;
    doc.line(120, y, 196, y);
    y += 6;
    doc.text(`Câmbio (ZAR/MZN): ${order.exchangeRateZAR_MZN.toFixed(2)}`, 120, y);
    y += 5;
    doc.text(`Taxa de transporte: ${order.transportFee.toFixed(2)} MZN`, 120, y);
    y += 5;
    doc.text(`Total: ${order.totalValueMZN.toFixed(2)} MZN`, 120, y);
    y += 5;
    doc.text(`Valor pago: ${order.paidAmount.toFixed(2)} MZN`, 120, y);
    y += 5;
    const debtText = `Saldo em dívida: ${order.debtBalance.toFixed(2)} MZN`;
    doc.setTextColor(order.debtBalance > 0 ? 200 : 0, 0, 0);
    doc.text(debtText, 120, y);
    doc.setTextColor(0, 0, 0);

    // Footer
    y += 12;
    doc.setFontSize(9);
    doc.text(
      'Obrigado pela sua confiança — Faça compras na África do Sul sentado na sua casa',
      105,
      y,
      { align: 'center' }
    );

    doc.save(`FACTURA-${order.orderNumber}.pdf`);
  }

  generateReceipt(order: Order, payment: Payment, config: Configuration): void {
    const doc = new jsPDF();
    let y = 14;

    doc.setFontSize(14);
    doc.text('RECIBO DE PAGAMENTO', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.text(`Encomenda: ${order.orderNumber}`, 14, y);
    y += 5;
    doc.text(`Cliente: ${order.customerName}`, 14, y);
    y += 5;
    doc.text(`Data pagamento: ${payment.date.toLocaleDateString()}`, 14, y);
    y += 5;
    doc.text(`Valor pago: ${payment.amount.toFixed(2)} MZN`, 14, y);
    y += 5;
    doc.text(`Forma de pagamento: ${payment.paymentMethod}`, 14, y);
    y += 5;
    doc.text(`Recebido por: ${payment.receivedBy}`, 14, y);

    y += 10;
    doc.setFontSize(9);
    doc.text(
      'Obrigado pela sua confiança — Faça compras na África do Sul sentado na sua casa',
      105,
      y,
      { align: 'center' }
    );

    doc.save(`RECIBO-${order.orderNumber}-${payment.id}.pdf`);
  }

  private truncate(text: string, max: number): string {
    if (!text) return '';
    return text.length > max ? text.substring(0, max - 1) + '…' : text;
  }
}

