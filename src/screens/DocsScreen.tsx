import React, { useEffect, useState } from 'react';
import { KeyRound, ArrowLeftRight, Webhook, Store, Send, Copy, Check, AlertTriangle, Lightbulb, Menu, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { API_URL } from '../lib/api';

// Public API docs (/docs). Content mirrors the platform's integration docs, branded for Valen Finance.

const SECTIONS = [
  { id: 'autenticacao', label: 'Autenticação', icon: KeyRound },
  { id: 'transacoes', label: 'Transações', icon: ArrowLeftRight },
  { id: 'pix-out', label: 'PIX Out', icon: Send },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'sellers', label: 'Sellers', icon: Store },
];

const CodeBlock: React.FC<{ lang: string; code: string }> = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0B150F] border-b border-slate-800">
        <span className="text-[11px] font-mono text-slate-400">{lang}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="p-4 bg-[#050A07] text-[12.5px] leading-relaxed text-slate-200 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const Table: React.FC<{ head: string[]; rows: (string | React.ReactNode)[][] }> = ({ head, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 my-4">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <tr>{head.map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} className={`px-4 py-3 align-top ${j === 0 ? 'font-mono text-[13px] text-[#07A33E] whitespace-nowrap' : 'text-slate-600'}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Endpoint: React.FC<{ method: 'GET' | 'POST'; path: string }> = ({ method, path }) => (
  <div className="flex items-center gap-2 my-3">
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold text-white ${method === 'GET' ? 'bg-emerald-600' : 'bg-[#07A33E]'}`}>{method}</span>
    <code className="font-mono text-sm text-slate-800">{path}</code>
  </div>
);

const Callout: React.FC<{ kind: 'warn' | 'tip'; title: string; children: React.ReactNode }> = ({ kind, title, children }) => (
  <div className={`flex gap-3 rounded-xl border p-4 my-4 text-sm ${kind === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-primary-50 border-primary-200 text-primary-900'}`}>
    {kind === 'warn' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <Lightbulb className="w-5 h-5 shrink-0" />}
    <div>
      <p className="font-bold">{title}</p>
      <p className="mt-0.5 leading-relaxed">{children}</p>
    </div>
  </div>
);

const H2: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2 id={id} className="scroll-mt-20 lg:scroll-mt-8 text-2xl font-extrabold font-display text-slate-900 mb-3">
    {children}
  </h2>
);
const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-base font-bold text-slate-900 mt-8 mb-2">{children}</h3>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-sm text-slate-600 leading-relaxed my-2">{children}</p>;
const C: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="font-mono text-[12.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">{children}</code>
);

const BASE = API_URL.replace(/\/api$/, '');

const CREATE_REQ = `curl -X POST "${BASE}/api/generate-transaction" \\
  -H "Content-Type: application/json" \\
  -H "X-Secret-Key: SUA_SECRET_KEY" \\
  -H "X-Public-Key: SUA_PUBLIC_KEY" \\
  -d '{
    "provider": "Seu checkout",
    "client_name": "Joao da Silva",
    "client_email": "joao@email.com",
    "client_document": "48001582817",
    "client_mobile_phone": "11999999999",
    "post_back_url": "https://seusite.com/webhook",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "campanha_verao",
    "utm_term": "produto_teste",
    "products": [
      {
        "product_name": "Produto Exemplo",
        "quantity": 1,
        "value": 100.00
      }
    ]
  }'`;

const CREATE_RES = `{
  "success": true,
  "data": {
    "id": "txn_abc123def456",
    "status": "pending",
    "amount": 100.00,
    "paymentMethod": "pix",
    "pix": {
      "qrCode": "00020126580014br.gov.bcb.pix...",
      "qrCodeBase64": "data:image/png;base64,...",
      "expiresAt": "2026-02-17T23:59:59.000Z"
    },
    "customer": {
      "name": "Joao da Silva",
      "email": "joao@email.com",
      "document": "12345678900"
    },
    "createdAt": "2026-02-17T12:00:00.000Z"
  }
}`;

const STATUS_REQ = `curl -X GET "${BASE}/api/v2/get/payment/{transaction_id}" \\
  -H "Accept: application/json" \\
  -H "X-Public-Key: SUA_PUBLIC_KEY" \\
  -H "X-Secret-Key: SUA_SECRET_KEY"`;

const STATUS_RES = `{
  "id": "D798A15DB35E",
  "external_ref": null,
  "pix": {
    "qrcode": "00020101021226640014br.gov.bcb.pix2542...6304F1D5",
    "expirationDate": "2026-10-21T03:00:00.000000Z",
    "end2EndId": null,
    "receiptUrl": null
  },
  "card": null,
  "boleto": null,
  "amount": "100.00",
  "paidAt": null,
  "status": "PENDING",
  "customer": {
    "name": "Joao da Silva",
    "email": "joao@email.com",
    "phone": "11999999999",
    "documents": { "number": "48001582817", "type": { "documentType": "cpf" } }
  }
}`;

const PUBLIC_STATUS_REQ = `curl -X GET "${BASE}/api/payment-status/{transaction_id}"`;

const PUBLIC_STATUS_RES = `{
  "transaction_id": "faddfdab-46e0-41fa-bc10-d28c29733fff",
  "is_paid": false,
  "status": "PENDING",
  "status_description": "Aguardando pagamento",
  "payment_method": "PIX",
  "total": 100.00,
  "paid_at": null
}`;

const PIX_OUT_IP_ERR = `{
  "error": "IP_NOT_ALLOWED",
  "message": "Este IP não está autorizado a usar o PIX Out.",
  "ip": "203.0.113.55"
}`;

const PIX_OUT_REQ = `curl -X POST "${BASE}/api/v1/pix-out" \\
  -H "Content-Type: application/json" \\
  -H "X-Public-Key: SUA_PUBLIC_KEY" \\
  -H "X-Secret-Key: SUA_SECRET_KEY" \\
  -d '{
    "amount": 150.00,
    "pix_key": "joao@email.com",
    "pix_type": "EMAIL",
    "external_id": "saque-8231",
    "postback_url": "https://seusistema.com/webhooks/pix-out"
  }'`;

const PIX_OUT_RES = `{
  "success": true,
  "data": {
    "id": "9b1f6c2e-3a4d-4f7b-9e21-5c8d0a7b3f10",
    "external_id": "saque-8231",
    "status": "PENDING",
    "amount": 150.00,
    "fee": 2.00,
    "net_amount": 148.00,
    "pix_key": "joao@email.com",
    "pix_type": "EMAIL",
    "created_at": "2026-09-30T12:00:00-03:00",
    "paid_at": null
  }
}`;

const PIX_OUT_GET_REQ = `curl -X GET "${BASE}/api/v1/pix-out/{id_ou_external_id}" \\
  -H "X-Public-Key: SUA_PUBLIC_KEY" \\
  -H "X-Secret-Key: SUA_SECRET_KEY"`;

const PIX_OUT_POSTBACK = `POST https://seusistema.com/webhooks/pix-out
Content-Type: application/json
User-Agent: PixOut-Postback/1.0
X-Webhook-Event: pix_out.paid
X-Webhook-Timestamp: 1759258112
X-Webhook-Signature: sha256=5d41402abc4b2a76b9719d911017c592...

{
  "event": "pix_out.paid",
  "data": {
    "id": "9b1f6c2e-3a4d-4f7b-9e21-5c8d0a7b3f10",
    "external_id": "saque-8231",
    "status": "PAID",
    "amount": 150,
    "fee": 2,
    "net_amount": 148,
    "pix_key": "joao@email.com",
    "pix_type": "EMAIL",
    "created_at": "2026-09-30T18:20:00+00:00",
    "paid_at": "2026-09-30T18:25:12+00:00"
  }
}`;

const PIX_OUT_SIG_PHP = `<?php
$body      = file_get_contents('php://input');           // corpo cru, antes de json_decode
$timestamp = $_SERVER['HTTP_X_WEBHOOK_TIMESTAMP'] ?? '';
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';

$expected = 'sha256=' . hash_hmac('sha256', $timestamp . '.' . $body, 'SUA_SECRET_KEY');

if (!hash_equals($expected, $signature) || abs(time() - (int) $timestamp) > 300) {
    http_response_code(401);
    exit;
}

$evento = json_decode($body, true);
// $evento['data']['external_id'], $evento['data']['status'] ...
http_response_code(200);`;

const PIX_OUT_SIG_JS = `import crypto from "node:crypto";
import express from "express";

const app = express();

// express.raw: a assinatura é calculada sobre o corpo exatamente como chegou
app.post("/webhooks/pix-out", express.raw({ type: "application/json" }), (req, res) => {
  const timestamp = req.header("X-Webhook-Timestamp") ?? "";
  const signature = req.header("X-Webhook-Signature") ?? "";
  const expected = "sha256=" + crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(timestamp + "." + req.body.toString("utf8"))
    .digest("hex");

  const valid = signature.length === expected.length
    && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return res.sendStatus(401);
  }

  const evento = JSON.parse(req.body.toString("utf8"));
  // evento.data.external_id, evento.data.status ...
  res.sendStatus(200);
});`;

const WEBHOOK_PAYLOAD = `{
  "event": "transaction.paid",
  "data": {
    "id": "txn_abc123def456",
    "status": "paid",
    "amount": 100.00,
    "paymentMethod": "pix",
    "paidAt": "2026-02-17T12:05:00.000Z",
    "customer": {
      "name": "Joao da Silva",
      "email": "joao@email.com"
    }
  },
  "timestamp": "2026-02-17T12:05:01.000Z"
}`;

const SELLER_REQ = `curl -X GET "${BASE}/api/seller" \\
  -H "X-Public-Key: SUA_PUBLIC_KEY" \\
  -H "X-Secret-Key: SUA_SECRET_KEY"`;

const SELLER_RES = `{
  "id": 1,
  "userId": 1,
  "legalName": "Empresa Exemplo",
  "blocked": false,
  "invoiceDescriptor": "Empresa Exemplo",
  "commercialName": null,
  "createdAt": "2025-12-28T01:44:04.000000Z",
  "uploadedDocuments": true,
  "user": {
    "id": 1,
    "email": "contato@exemplo.com",
    "phone": "11999999999",
    "name": "Empresa Exemplo",
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "isAdmin": false,
    "isMaster": false,
    "createdAt": "2025-12-28T01:44:04.000000Z"
  },
  "document": { "id": 1, "number": "99988877766", "type": "cpf" },
  "permissions": {
    "id": null,
    "companyId": 1,
    "isCreditCardAvailable": true,
    "isBoletoAvailable": true,
    "isPixAvailable": true,
    "transferEnabled": true,
    "transferPriceCents": 200,
    "anticipationEnabled": false,
    "anticipatableVolumePercentage": 0,
    "anticipationPricePercent": 0,
    "minAnticipatableDays": 0,
    "createdAt": null
  },
  "details": {
    "id": 1,
    "averageRevenue": null,
    "averageTicket": null,
    "physicalProducts": false,
    "productsDescription": null,
    "siteUrl": null,
    "phone": "11999999999",
    "email": "contato@exemplo.com",
    "createdAt": "2025-12-28T01:44:04.000000Z"
  },
  "address": {
    "id": 1,
    "street": "Rua Exemplo, 123",
    "streetNumber": null,
    "complement": null,
    "zipCode": "01234567",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "country": "br"
  },
  "revenue": {
    "totalAmount": 0, "totalCount": 0,
    "cardAmount": 0, "cardCount": 0,
    "pixAmount": 0, "pixCount": 0,
    "boletoAmount": 0, "boletoCount": 0,
    "chargebackAmount": 0, "chargebackCount": 0,
    "refundAmount": 0, "refundCount": 0,
    "createdAt": "2025-12-28T01:44:04.000000Z"
  },
  "defaultRecipient": {
    "id": 1,
    "legalName": "Empresa Exemplo",
    "createdAt": "2025-12-28T01:44:04.000000Z",
    "document": { "id": 1, "number": "99988877766", "type": "cpf" },
    "transferSettings": {
      "id": null,
      "transferEnabled": true,
      "automaticAnticipationEnabled": false,
      "anticipatableVolumePercentage": 0,
      "createdAt": null
    },
    "balance": { "available": 0, "updatedAt": "2025-12-28T01:44:04.000000Z" }
  }
}`;

export const DocsScreen: React.FC = () => {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'Documentação da API · Valen Finance';
    // Highlight the last section whose top has scrolled past the top of the viewport.
    const onScroll = () => {
      const current = SECTIONS.filter((sec) => (document.getElementById(sec.id)?.getBoundingClientRect().top ?? 1) <= 120).pop();
      setActive((current ?? SECTIONS[0]).id);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#050A07]">
        <Logo size="sm" />
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-white" aria-label="Menu">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#050A07] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <Logo size="md" />
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#07A33E]">API</span>
            <span className="text-xs text-slate-400">Documentação</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                active === s.id ? 'bg-[#07A33E] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="rounded-xl p-4 bg-white/5">
            <p className="text-[11px] text-slate-400">Base URL</p>
            <p className="text-xs font-mono mt-1 break-all text-[#00D15F]">{API_URL}</p>
          </div>
        </div>
      </aside>
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMenuOpen(false)} />}

      {/* Content */}
      <main className="lg:ml-72">
        <div className="max-w-4xl px-6 py-12 lg:px-12">
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold font-display tracking-tight">API Valen Finance</h1>
            <p className="text-slate-500 mt-2">Integre pagamentos de forma rápida e segura com a nossa API.</p>
          </div>

          {/* Autenticação */}
          <section>
            <H2 id="autenticacao">Autenticação</H2>
            <P>
              Todas as requisições para a API devem ser autenticadas com os headers <C>X-Secret-Key</C> e <C>X-Public-Key</C>.
            </P>
            <H3>Obtendo suas credenciais</H3>
            <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-1 my-2">
              <li>Acesse o painel e vá até <strong>Integrações</strong></li>
              <li>Copie sua <strong>Secret Key</strong> e sua <strong>Public Key</strong></li>
              <li>Inclua ambas como headers em todas as requisições</li>
            </ol>
            <H3>Headers obrigatórios</H3>
            <Table
              head={['Header', 'Tipo', 'Descrição']}
              rows={[
                ['X-Secret-Key', 'string', 'Sua chave secreta de API'],
                ['X-Public-Key', 'string', 'Sua chave pública de API'],
                ['Content-Type', 'string', 'application/json'],
              ]}
            />
            <Callout kind="warn" title="Importante">
              Nunca exponha sua Secret Key em código client-side (frontend, apps mobile). Use-a somente em requisições server-side.
            </Callout>
          </section>

          {/* Transações */}
          <section className="mt-14 pt-12 border-t border-slate-200">
            <H2 id="transacoes">Transações</H2>
            <Endpoint method="POST" path="/api/generate-transaction" />
            <P>Cria uma nova transação de pagamento e retorna os dados da transação criada.</P>
            <H3>Parâmetros do body</H3>
            <Table
              head={['Parâmetro', 'Tipo', 'Obrigatório', 'Descrição']}
              rows={[
                ['client_name', 'string', 'Sim', 'Nome completo do cliente'],
                ['client_email', 'string', 'Sim', 'E-mail do cliente'],
                ['client_document', 'string', 'Sim', 'CPF do cliente (somente números)'],
                ['client_mobile_phone', 'string', 'Sim', 'Telefone do cliente'],
                ['external_ref', 'string', 'Não', 'Referência externa do pedido'],
                ['post_back_url', 'string', 'Não', 'URL para receber notificações de webhook'],
                ['provider', 'string', 'Não', 'Nome do provider'],
                ['utm_source', 'string', 'Não', 'Origem da UTM'],
                ['utm_medium', 'string', 'Não', 'Mídia da UTM'],
                ['utm_campaign', 'string', 'Não', 'Campanha da UTM'],
                ['utm_term', 'string', 'Não', 'Termo da UTM'],
                ['products', 'array', 'Não', 'Lista de produtos da transação'],
                ['products[].product_id', 'number', 'Não', 'ID do produto, que deve existir na plataforma. Se informado, não é necessário enviar products[].product_name'],
                ['products[].product_name', 'string', 'Não', 'Nome do produto. Opcional quando products[].product_id for informado'],
                ['products[].quantity', 'number', 'Não', 'Quantidade do produto'],
                ['products[].value', 'number', 'Não', 'Valor unitário em reais, ex.: 100.00'],
              ]}
            />
            <H3>Exemplo de request</H3>
            <CodeBlock lang="bash" code={CREATE_REQ} />
            <H3>Exemplo de response</H3>
            <CodeBlock lang="json" code={CREATE_RES} />

            <H3>Consultar o status da transação</H3>
            <Endpoint method="GET" path="/api/v2/get/payment/{transaction_id}" />
            <P>
              Use o <C>transaction_id</C> devolvido na criação da cobrança. Esta rota exige as mesmas duas chaves do endpoint de criação e
              devolve a cobrança completa: PIX, valores, data de pagamento e dados do cliente.
            </P>
            <CodeBlock lang="bash" code={STATUS_REQ} />
            <CodeBlock lang="json" code={STATUS_RES} />
            <Callout kind="warn" title="Atenção ao código HTTP">
              Esta rota responde 403 também quando a transação não existe. Não trate 403 como chave inválida: confira o campo{' '}
              <C>error</C> do corpo. Chave errada devolve <C>Invalid API keys or no associated gateway account</C>; id inexistente devolve{' '}
              <C>transaction not found</C>. Existe também a versão v1, com a mesma assinatura e resposta mais enxuta.
            </Callout>

            <H3>Alternativa pública (só o status)</H3>
            <Endpoint method="GET" path="/api/payment-status/{transaction_id}" />
            <P>
              Sem autenticação, útil para a própria página de pagamento consultar enquanto o comprador aguarda. Devolve <C>is_paid</C> pronto
              e responde 404 quando a transação não existe.
            </P>
            <CodeBlock lang="bash" code={PUBLIC_STATUS_REQ} />
            <CodeBlock lang="json" code={PUBLIC_STATUS_RES} />
          </section>

          {/* PIX Out */}
          <section className="mt-14 pt-12 border-t border-slate-200">
            <H2 id="pix-out">PIX Out</H2>
            <P>
              Envia um Pix do seu saldo para qualquer chave. A autenticação é a mesma das outras rotas (<C>X-Public-Key</C> e{' '}
              <C>X-Secret-Key</C>), e além dela a chamada precisa sair de um IP autorizado.
            </P>

            <H3>Autorizando os IPs</H3>
            <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-1 my-2">
              <li>No painel, abra <strong>Integrações &gt; PIX Out</strong></li>
              <li>Informe o IP público do servidor que vai chamar a rota (IPv4, IPv6 ou faixa CIDR até /16) e confirme com o código do app autenticador</li>
              <li>Repita para cada servidor. Chamadas de qualquer outro IP são recusadas com 403</li>
            </ol>
            <P>
              Sem nenhum IP cadastrado o PIX Out fica desligado para a conta. A resposta de IP recusado traz o IP que chegou até nós, útil para
              descobrir o IP de saída do seu servidor:
            </P>
            <CodeBlock lang="json" code={PIX_OUT_IP_ERR} />

            <Endpoint method="POST" path="/api/v1/pix-out" />
            <P>
              Debita o valor do seu saldo e coloca o Pix na fila de pagamento. Responde <C>201</C> quando cria e <C>200</C> quando o{' '}
              <C>external_id</C> já existia.
            </P>
            <H3>Parâmetros do body</H3>
            <Table
              head={['Parâmetro', 'Tipo', 'Obrigatório', 'Descrição']}
              rows={[
                ['amount', 'number', 'Sim', 'Valor debitado do seu saldo, em reais (ex.: 150.00). A taxa de saque sai deste valor.'],
                ['pix_key', 'string', 'Sim', 'Chave Pix de destino. CPF, CNPJ e telefone podem vir com ou sem máscara.'],
                ['pix_type', 'string', 'Sim', 'Tipo da chave: CPF, CNPJ, EMAIL, PHONE (DDD + número) ou RANDOM (chave aleatória).'],
                ['external_id', 'string', 'Não', 'Seu identificador (até 100 caracteres). Repetir o mesmo valor devolve o PIX Out já criado, sem pagar de novo.'],
                [
                  'postback_url',
                  'string',
                  'Não',
                  'URL (http ou https, até 500 caracteres) que recebe um POST quando o PIX Out é pago, falha ou é cancelado. Veja Postback abaixo.',
                ],
              ]}
            />
            <H3>Exemplo de request</H3>
            <CodeBlock lang="bash" code={PIX_OUT_REQ} />
            <H3>Exemplo de response</H3>
            <CodeBlock lang="json" code={PIX_OUT_RES} />
            <P>
              <C>amount</C> é o total debitado do saldo, <C>fee</C> é a taxa de saque e <C>net_amount</C> é o que chega na chave de destino.
            </P>

            <H3>Consultar o PIX Out</H3>
            <Endpoint method="GET" path="/api/v1/pix-out/{id}" />
            <P>
              Aceita o <C>id</C> devolvido na criação ou o seu <C>external_id</C>. Também exige IP autorizado e devolve o mesmo objeto da
              criação; 404 quando não existe.
            </P>
            <CodeBlock lang="bash" code={PIX_OUT_GET_REQ} />

            <H3>Status</H3>
            <Table
              head={['Status', 'Descrição']}
              rows={[
                ['PENDING', 'Na fila de pagamento (transferência automática ou aguardando aprovação).'],
                ['PAID', <>Pix enviado ao destino. <C>paid_at</C> traz a data do pagamento.</>],
                ['FAILED', 'O banco recusou a transferência (ex.: chave inexistente). Fale com o suporte.'],
                ['CANCELED', 'Saque cancelado ou recusado na análise; o valor volta para o saldo.'],
              ]}
            />

            <H3>Erros</H3>
            <Table
              head={['HTTP / error', 'Descrição']}
              rows={[
                ['403 PIX_OUT_IP_NOT_CONFIGURED', 'Nenhum IP cadastrado em Integrações > PIX Out. A rota fica desligada até você autorizar um IP.'],
                ['403 IP_NOT_ALLOWED', <>A chamada veio de um IP fora da lista. O campo <C>ip</C> mostra o IP que chegou até nós.</>],
                ['422 VALIDATION_ERROR', <>Campo faltando ou em formato inválido (detalhes em <C>errors</C>).</>],
                ['422 INVALID_PIX_KEY', <>A chave não bate com o <C>pix_type</C> informado.</>],
                ['422 AMOUNT_BELOW_MINIMUM', 'Valor abaixo do mínimo de transferência da plataforma.'],
                ['422 INSUFFICIENT_BALANCE', <>Saldo disponível menor que o <C>amount</C>.</>],
                ['403 ACCOUNT_BLOCKED', 'Conta sem permissão para transferências.'],
                ['409 TRY_AGAIN', <>Outro PIX Out da conta ainda estava sendo processado. Repita a chamada (use <C>external_id</C>).</>],
              ]}
            />

            <H3>Postback</H3>
            <P>
              Envie <C>postback_url</C> na criação e a plataforma avisa o seu sistema quando o PIX Out muda de situação, sem você precisar
              consultar. O aviso sai em até 1 minuto depois da mudança, como um POST com o mesmo objeto da consulta. Não há aviso para{' '}
              <C>PENDING</C>: esse é o status que já volta na criação.
            </P>
            <H3>Eventos</H3>
            <Table
              head={['Evento', 'Descrição']}
              rows={[
                ['pix_out.paid', <>O Pix chegou ao destino (status <C>PAID</C>). <C>paid_at</C> traz a data do pagamento.</>],
                ['pix_out.failed', <>O banco recusou a transferência (status <C>FAILED</C>). Se ela for reprocessada e paga, chega depois um <C>pix_out.paid</C>.</>],
                ['pix_out.canceled', <>O saque foi cancelado ou recusado na análise (status <C>CANCELED</C>); o valor volta para o saldo.</>],
              ]}
            />
            <H3>Headers enviados</H3>
            <Table
              head={['Header', 'Descrição']}
              rows={[
                ['X-Webhook-Event', <>Nome do evento, igual ao campo <C>event</C> do corpo.</>],
                ['X-Webhook-Timestamp', 'Momento do envio, em segundos (Unix). Muda a cada tentativa.'],
                ['X-Webhook-Signature', <><C>{'sha256=HMAC_SHA256(sua Secret Key, "<timestamp>.<corpo>")'}</C>, em hexadecimal.</>],
              ]}
            />
            <H3>Exemplo de postback</H3>
            <CodeBlock lang="http" code={PIX_OUT_POSTBACK} />

            <H3>Validando a assinatura</H3>
            <P>
              Calcule o HMAC sobre o corpo cru, do jeito que chegou (não sobre o JSON já convertido), usando a Secret Key da chave de API que criou
              o PIX Out. Recuse também timestamps com mais de 5 minutos, para ninguém reenviar um aviso antigo.
            </P>
            <CodeBlock lang="php" code={PIX_OUT_SIG_PHP} />
            <CodeBlock lang="javascript" code={PIX_OUT_SIG_JS} />

            <H3>Entrega e novas tentativas</H3>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1 my-2">
              <li>Responda com HTTP 2xx em até 10 segundos para confirmar o recebimento.</li>
              <li>Erro 5xx, timeout ou falha de conexão: nova tentativa depois de 10s, 1min, 5min e 15min (5 tentativas no total).</li>
              <li>Resposta 4xx encerra as tentativas: o seu servidor recusou o aviso.</li>
              <li>
                Cada evento é enviado uma vez só; use <C>data.id</C> ou <C>data.external_id</C> para ignorar repetições do seu lado.
              </li>
              <li>O redirecionamento (3xx) não é seguido, e URLs de rede interna (localhost, 10.x, 192.168.x) são recusadas.</li>
            </ul>
            <P>
              Se o postback não chegar, a consulta <C>GET /api/v1/pix-out/{'{id}'}</C> continua valendo como fonte da verdade.
            </P>

            <Callout kind="tip" title="Boas práticas">
              Envie sempre um <C>external_id</C>: se a conexão cair antes da resposta, repita a mesma chamada sem risco de pagar duas vezes. O
              limite é de 60 requisições por minuto.
            </Callout>
          </section>

          {/* Webhooks */}
          <section className="mt-14 pt-12 border-t border-slate-200">
            <H2 id="webhooks">Webhooks</H2>
            <P>
              Webhooks permitem que sua aplicação receba notificações em tempo real sobre eventos da plataforma, como confirmação de
              pagamentos e mudanças de status.
            </P>
            <H3>Configurando webhooks</H3>
            <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-1 my-2">
              <li>Acesse <strong>Integrações</strong> no painel</li>
              <li>Clique em <strong>Novo Webhook</strong></li>
              <li>Informe a URL do seu endpoint e selecione os eventos desejados</li>
            </ol>
            <H3>Eventos disponíveis</H3>
            <Table
              head={['Evento', 'Descrição']}
              rows={[
                ['transaction.paid', 'Disparado quando um pagamento é confirmado'],
                ['transaction.refused', 'Disparado quando um pagamento é recusado'],
                ['transaction.pending', 'Disparado quando um pagamento fica pendente (aguardando pagamento)'],
                ['transaction.refunded', 'Disparado quando um pagamento é reembolsado'],
              ]}
            />
            <H3>Exemplo de payload</H3>
            <CodeBlock lang="json" code={WEBHOOK_PAYLOAD} />
            <Callout kind="tip" title="Dica">
              Seu endpoint deve retornar HTTP 200 para confirmar o recebimento. Caso contrário, a plataforma tentará reenviar o webhook até 3
              vezes.
            </Callout>
          </section>

          {/* Sellers */}
          <section className="mt-14 pt-12 border-t border-slate-200">
            <H2 id="sellers">Sellers</H2>
            <P>Consulte informações do seller, incluindo dados cadastrais, permissões, receita e configurações de transferência.</P>
            <Endpoint method="GET" path="/api/seller" />
            <P>Retorna as informações completas do seller autenticado.</P>
            <H3>Exemplo de request</H3>
            <CodeBlock lang="bash" code={SELLER_REQ} />
            <H3>Exemplo de response</H3>
            <CodeBlock lang="json" code={SELLER_RES} />
            <H3>Campos da response</H3>
            <Table
              head={['Campo', 'Tipo', 'Descrição']}
              rows={[
                ['id', 'number', 'ID do seller'],
                ['legalName', 'string', 'Nome legal do seller'],
                ['blocked', 'boolean', 'Status de bloqueio da conta'],
                ['user', 'object', 'Dados do usuário associado'],
                ['document', 'object', 'Documento (CPF/CNPJ)'],
                ['permissions', 'object', 'Permissões e configurações de pagamento'],
                ['revenue', 'object', 'Estatísticas de receita'],
                ['defaultRecipient', 'object', 'Dados do recebedor padrão e saldo'],
              ]}
            />
          </section>

          <p className="mt-16 pt-6 border-t border-slate-200 text-xs text-slate-400">© {new Date().getFullYear()} Valen Finance. Finanças sem complicação.</p>
        </div>
      </main>
    </div>
  );
};
