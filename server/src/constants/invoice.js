// Invoice generator (P4-03). Limits of what one invoice may hold, and the labels
// of the Excel file in the platform's languages (the screen and the printed
// sheet use the client's own translations).
export const INVOICE_LIMITS = {
  lines: 100,
  number: 40,
  partyName: 120,
  partyDetails: 1000,
  description: 300,
  notes: 2000,
  // Largest total accepted, in the currency's smallest unit: far above any real
  // invoice, and well inside the exact range of a JavaScript number.
  maxTotal: 10n ** 15n,
};

export const INVOICE_LANGUAGES = ['fr', 'en', 'ar'];

export const INVOICE_LABELS = {
  fr: {
    sheet: 'Facture',
    title: 'Facture',
    number: 'Numéro',
    issueDate: "Date d'émission",
    dueDate: "Date d'échéance",
    seller: 'Prestataire',
    buyer: 'Client',
    description: 'Désignation',
    quantity: 'Quantité',
    unitPrice: 'Prix unitaire HT',
    vatRate: 'TVA (%)',
    net: 'Total HT',
    vat: 'TVA',
    gross: 'Total TTC',
    vatAt: 'TVA à {{rate}} %',
    currency: 'Devise',
    notes: 'Mentions',
  },
  en: {
    sheet: 'Invoice',
    title: 'Invoice',
    number: 'Number',
    issueDate: 'Issue date',
    dueDate: 'Due date',
    seller: 'Seller',
    buyer: 'Customer',
    description: 'Description',
    quantity: 'Quantity',
    unitPrice: 'Unit price (excl. tax)',
    vatRate: 'VAT (%)',
    net: 'Total excl. tax',
    vat: 'VAT',
    gross: 'Total incl. tax',
    vatAt: 'VAT at {{rate}} %',
    currency: 'Currency',
    notes: 'Notes',
  },
  ar: {
    sheet: 'فاتورة',
    title: 'فاتورة',
    number: 'الرقم',
    issueDate: 'تاريخ الإصدار',
    dueDate: 'تاريخ الاستحقاق',
    seller: 'مقدّم الخدمة',
    buyer: 'العميل',
    description: 'البيان',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة خارج الرسوم',
    vatRate: 'الرسم على القيمة المضافة (%)',
    net: 'المجموع خارج الرسوم',
    vat: 'الرسم على القيمة المضافة',
    gross: 'المجموع بكل الرسوم',
    vatAt: 'الرسم بنسبة {{rate}} %',
    currency: 'العملة',
    notes: 'ملاحظات',
  },
};
