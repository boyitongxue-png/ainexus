import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Upload,
  X,
  AlertTriangle,
  Send,
  Building2,
  FileText,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/providers/trpc';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface RechargeApp {
  id: string;
  createdAt: string;
  paymentAmount: number;
  requestedCredits: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  payerName: string;
  paymentTime: string;
}

const initialApplications: RechargeApp[] = [
  {
    id: 'CHG-20240112-001',
    createdAt: '2024-01-12 09:30',
    paymentAmount: 5000,
    requestedCredits: 500000,
    status: 'approved',
    reviewNote: '转账已确认，积分已到账',
    payerName: '云启科技',
    paymentTime: '2024-01-11 14:20',
  },
  {
    id: 'CHG-20240118-002',
    createdAt: '2024-01-18 16:45',
    paymentAmount: 10000,
    requestedCredits: 1000000,
    status: 'pending',
    payerName: '智创未来',
    paymentTime: '2024-01-18 10:00',
  },
  {
    id: 'CHG-20240120-003',
    createdAt: '2024-01-20 11:20',
    paymentAmount: 2000,
    requestedCredits: 200000,
    status: 'rejected',
    reviewNote: '转账凭证模糊，无法确认，请重新提交',
    payerName: '李明',
    paymentTime: '2024-01-19 16:30',
  },
];

const bankInfo = {
  accountName: '云智未来科技有限公司',
  bank: '招商银行北京分行中关村支行',
  accountNumber: '1109 1234 5678 9012',
};

export default function Recharge() {

  const utils = trpc.useUtils();
  const { data: rechargeData } = trpc.credit.rechargeList.useQuery();
  const { data: balanceData } = trpc.credit.getBalance.useQuery();
  const rechargeCreate = trpc.credit.rechargeCreate.useMutation({
    onSuccess: () => { utils.credit.rechargeList.invalidate(); utils.credit.getBalance.invalidate(); }
  });
  const recharges = useMemo(() => {
    if (!rechargeData) return [];
    return rechargeData.items.map((r: any) => ({
      id: String(r.id), date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '',
      amount: Number(r.amount) || 0, method: 'bank_transfer', status: r.status || 'pending',
      description: r.description || '', processedAt: r.status === 'approved' ? new Date().toISOString() : null,
    }));
  }, [rechargeData]);
  const creditBalance = Number(balanceData?.balance || 0);

  const [applications, setApplications] = useState<RechargeApp[]>(initialApplications);
  const [form, setForm] = useState({
    paymentAmount: '',
    requestedCredits: '',
    payerName: '',
    paymentTime: '',
    paymentNote: '',
    additionalNotes: '',
  });
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detailApp, setDetailApp] = useState<RechargeApp | null>(null);

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      setVoucherFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setVoucherPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setVoucherPreview(null);
      }
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileChange(file);
    },
    [handleFileChange]
  );

  const handleSubmit = useCallback(() => {
    if (!form.paymentAmount || !form.requestedCredits || !form.payerName || !form.paymentTime) return;

    const newApp: RechargeApp = {
      id: `CHG-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(applications.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toLocaleString('zh-CN'),
      paymentAmount: Number(form.paymentAmount),
      requestedCredits: Number(form.requestedCredits),
      status: 'pending',
      payerName: form.payerName,
      paymentTime: form.paymentTime,
    };

    setApplications((prev) => [newApp, ...prev]);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    setForm({
      paymentAmount: '',
      requestedCredits: '',
      payerName: '',
      paymentTime: '',
      paymentNote: '',
      additionalNotes: '',
    });
    setVoucherFile(null);
    setVoucherPreview(null);
  }, [form, applications.length]);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: '待审核', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
    approved: { label: '已通过', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
    rejected: { label: '已拒绝', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  };

  const isFormValid =
    form.paymentAmount &&
    form.requestedCredits &&
    form.payerName &&
    form.paymentTime;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-space text-[36px] font-semibold text-white leading-[1.25]">充值申请</h1>
        <p className="mt-1 text-[var(--slate-400)]">选择充值方式，为您的账户添加积分。</p>
      </motion.div>

      {/* Payment Info + Form */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
        {/* Left - Bank Transfer Info */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
          <h2 className="font-space text-lg font-semibold text-white mb-1">线下转账充值</h2>
          <p className="text-xs text-[var(--slate-500)] mb-5">1-3 个工作日到账</p>

          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#3366FF]" />
            转账信息
          </h3>

          <div className="space-y-4">
            <div className="bg-[var(--dark-bg)] rounded-lg p-4 flex items-center justify-between group">
              <div>
                <p className="text-xs text-[var(--slate-500)] mb-1">收款公司名称</p>
                <p className="text-sm text-white font-medium">{bankInfo.accountName}</p>
              </div>
              <button
                onClick={() => handleCopy(bankInfo.accountName, 'accountName')}
                className="p-2 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
              >
                {copiedField === 'accountName' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="bg-[var(--dark-bg)] rounded-lg p-4 flex items-center justify-between group">
              <div>
                <p className="text-xs text-[var(--slate-500)] mb-1">开户银行</p>
                <p className="text-sm text-white font-medium">{bankInfo.bank}</p>
              </div>
              <button
                onClick={() => handleCopy(bankInfo.bank, 'bank')}
                className="p-2 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
              >
                {copiedField === 'bank' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="bg-[var(--dark-bg)] rounded-lg p-4 flex items-center justify-between group">
              <div>
                <p className="text-xs text-[var(--slate-500)] mb-1">银行账号</p>
                <p className="text-sm text-white font-jetbrains">{bankInfo.accountNumber}</p>
              </div>
              <button
                onClick={() => handleCopy(bankInfo.accountNumber.replace(/\s/g, ''), 'accountNumber')}
                className="p-2 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
              >
                {copiedField === 'accountNumber' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[#F59E0B]">
              <p className="font-medium mb-1">转账备注要求</p>
              <p>请在转账备注中注明您的工作区 ID: WS-abc123</p>
              <p className="mt-1">转账完成后请填写右侧表单提交审核</p>
            </div>
          </div>
        </div>

        {/* Right - Application Form */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
          <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#3366FF]" />
            充值申请表单
          </h3>

          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-[#10B981]" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">申请已提交</h4>
                <p className="text-sm text-[var(--slate-400)] text-center">我们将在 1-3 个工作日内审核您的充值申请</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Payment Amount */}
                <div>
                  <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                    实际转账金额 <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)] text-sm">¥</span>
                    <input
                      type="number"
                      value={form.paymentAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          paymentAmount: val,
                          requestedCredits: val ? String(Number(val) * 100) : '',
                        }));
                      }}
                      placeholder="请输入转账金额"
                      className="w-full h-10 pl-7 pr-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors"
                    />
                  </div>
                </div>

                {/* Requested Credits */}
                <div>
                  <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                    申请积分数量 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.requestedCredits}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, requestedCredits: e.target.value }))
                    }
                    placeholder="1 元 = 100 积分"
                    className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors"
                  />
                  {form.paymentAmount && form.requestedCredits && (
                    <p className="text-xs text-[var(--slate-500)] mt-1">
                      = ¥{form.paymentAmount} × 100 = {Number(form.requestedCredits).toLocaleString()} 积分
                    </p>
                  )}
                </div>

                {/* Payer Name */}
                <div>
                  <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                    付款账户名称 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.payerName}
                    onChange={(e) => setForm((prev) => ({ ...prev, payerName: e.target.value }))}
                    placeholder="请输入付款账户名"
                    className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors"
                  />
                </div>

                {/* Payment Time */}
                <div>
                  <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                    转账时间 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.paymentTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, paymentTime: e.target.value }))}
                    className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* Payment Note */}
                <div>
                  <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                    转账备注
                  </label>
                  <input
                    type="text"
                    value={form.paymentNote}
                    onChange={(e) => setForm((prev) => ({ ...prev, paymentNote: e.target.value }))}
                    placeholder="请输入转账时填写的备注"
                    className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors"
                  />
                </div>

                {/* Voucher Upload */}
                <div>
                  <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                    转账凭证截图
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => !voucherFile && document.getElementById('voucher-input')?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-[#3366FF] bg-[rgba(51,102,255,0.05)]'
                        : voucherFile
                        ? 'border-[#10B981] bg-[rgba(16,185,129,0.05)]'
                        : 'border-[var(--dark-border)] hover:border-[var(--slate-500)]'
                    }`}
                  >
                    <input
                      id="voucher-input"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {voucherFile ? (
                      <div className="flex items-center justify-center gap-3">
                        {voucherPreview ? (
                          <img src={voucherPreview} alt="凭证预览" className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#10B981]" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-sm text-white">{voucherFile.name}</p>
                          <p className="text-xs text-[var(--slate-500)]">
                            {(voucherFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setVoucherFile(null);
                            setVoucherPreview(null);
                          }}
                          className="p-1.5 rounded-md text-[var(--slate-500)] hover:text-[#EF4444] hover:bg-[var(--dark-hover)] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[var(--slate-500)] mx-auto mb-2" />
                        <p className="text-sm text-[var(--slate-400)]">
                          拖拽文件到此处，或 <span className="text-[#3366FF]">点击上传</span>
                        </p>
                        <p className="text-xs text-[var(--slate-500)] mt-1">
                          支持 JPG, PNG, PDF，最大 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                    附加备注
                  </label>
                  <textarea
                    value={form.additionalNotes}
                    onChange={(e) => setForm((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="其他需要说明的信息..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] hover:shadow-[0_0_60px_rgba(51,102,255,0.25)] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#3366FF] disabled:hover:shadow-none disabled:active:scale-100"
                >
                  <Send className="w-4 h-4" />
                  提交充值申请
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Application History */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="p-6 pb-4">
          <h2 className="font-space text-xl font-semibold text-white">充值记录</h2>
          <p className="text-xs text-[var(--slate-500)] mt-1">历史充值申请记录</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)] hover:bg-[var(--dark-sidebar)]">
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">申请单号</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">申请时间</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">付款金额</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">申请积分</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">审核状态</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">审核备注</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app, idx) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="border-b border-[var(--dark-border)] hover:bg-[var(--dark-hover)] transition-colors"
                >
                  <TableCell className="px-4">
                    <span className="font-jetbrains text-sm text-[#7A9FFF]">{app.id}</span>
                  </TableCell>
                  <TableCell className="px-4 text-xs text-[var(--slate-500)]">
                    {app.createdAt}
                  </TableCell>
                  <TableCell className="px-4">
                    <span className="font-jetbrains text-sm text-white">¥{app.paymentAmount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="px-4">
                    <span className="font-jetbrains text-sm text-white">{app.requestedCredits.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="px-4">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: statusConfig[app.status].bg,
                        color: statusConfig[app.status].color,
                      }}
                    >
                      {statusConfig[app.status].label}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 text-sm text-[var(--slate-400)] max-w-[200px] truncate">
                    {app.reviewNote || '-'}
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <button
                      onClick={() => setDetailApp(app)}
                      className="text-xs text-[#3366FF] hover:text-[#7A9FFF] transition-colors"
                    >
                      查看
                    </button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!detailApp} onOpenChange={() => setDetailApp(null)}>
        <DialogContent className="bg-[var(--dark-card)] border-[var(--dark-border)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-space">充值申请详情</DialogTitle>
          </DialogHeader>
          {detailApp && (
            <div className="space-y-3 text-sm mt-2">
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">申请单号</span>
                <span className="font-jetbrains text-[#7A9FFF]">{detailApp.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">申请时间</span>
                <span className="text-[var(--slate-300)]">{detailApp.createdAt}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">付款账户</span>
                <span className="text-[var(--slate-300)]">{detailApp.payerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">转账时间</span>
                <span className="text-[var(--slate-300)]">{detailApp.paymentTime}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">付款金额</span>
                <span className="font-jetbrains text-white">¥{detailApp.paymentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">申请积分</span>
                <span className="font-jetbrains text-white">{detailApp.requestedCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">审核状态</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: statusConfig[detailApp.status].bg,
                    color: statusConfig[detailApp.status].color,
                  }}
                >
                  {statusConfig[detailApp.status].label}
                </span>
              </div>
              {detailApp.reviewNote && (
                <div className="flex justify-between py-2">
                  <span className="text-[var(--slate-400)]">审核备注</span>
                  <span className="text-[var(--slate-300)] text-right">{detailApp.reviewNote}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
