export type ScreenId =
  | 'inicio'
  | 'transacoes'
  | 'recebimentos'
  | 'saques'
  | 'taxas'
  | 'chargebacks'
  | 'produtos'
  | 'links'
  | 'assinaturas'
  | 'integracoes'
  | 'adquirentes'
  | 'relatorios'
  | 'configuracoes';

export type PaymentMethod = 'pix' | 'cartao' | 'boleto' | 'outros';

export type TransactionStatus =
  | 'Aprovado'
  | 'Pendente'
  | 'Recusado'
  | 'Reembolsado'
  | 'Expirado'
  | 'Cancelado';

export interface Transaction {
  id: string;
  code: string;
  date: string;
  time: string;
  fullDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerDocument?: string;
  method: PaymentMethod;
  cardBrand?: string;
  cardLast4?: string;
  installments?: number;
  amount: number;
  status: TransactionStatus;
  campaign: string;
  origin: string;
  authCode: string;
  ip: string;
  device: string;
  notes: string;
}

export interface Withdrawal {
  id: string;
  date: string;
  amount: number;
  pixKeyType: string;
  pixKey: string;
  bankName: string;
  holderName: string;
  status: 'Concluído' | 'Em processamento' | 'Pendente' | 'Rejeitado';
  receiptUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'Produto Digital' | 'Curso Online' | 'Assinatura' | 'Serviço' | 'Outros';
  price: number;
  salesCount: number;
  totalRevenue: number;
  status: 'Ativo' | 'Pausado';
  createdAt: string;
}

export interface PaymentLink {
  id: string;
  title: string;
  amount: number;
  url: string;
  salesCount: number;
  revenue: number;
  clicks: number;
  status: 'Ativo' | 'Expirado';
  createdAt: string;
}

export interface PixKey {
  id: string;
  type: 'CPF / CNPJ' | 'E-mail' | 'Telefone' | 'Chave aleatória';
  key: string;
  holderName: string;
  bankName: string;
  isDefault?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'payment' | 'withdrawal' | 'security' | 'alert';
}
