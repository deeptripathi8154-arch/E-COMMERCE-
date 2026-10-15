/**
 * Indian Currency & Invoice Arithmetic Utilities
 * Harvinder Telecom E-Commerce (Haldwani, Uttarakhand)
 */

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertHundreds(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    } else if (n > 0) {
      str += units[n];
    }
    return str.trim();
  }

  let crore = Math.floor(num / 10000000);
  num %= 10000000;
  let lakh = Math.floor(num / 100000);
  num %= 100000;
  let thousand = Math.floor(num / 1000);
  num %= 1000;
  let remainder = num;

  const parts: string[] = [];
  if (crore > 0) parts.push(convertHundreds(crore) + ' Crore');
  if (lakh > 0) parts.push(convertHundreds(lakh) + ' Lakh');
  if (thousand > 0) parts.push(convertHundreds(thousand) + ' Thousand');
  if (remainder > 0) parts.push(convertHundreds(remainder));

  return 'Rupees ' + parts.join(' ') + ' Only';
}
