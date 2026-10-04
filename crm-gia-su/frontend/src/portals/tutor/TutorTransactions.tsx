import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import PageTemplate from '../../components/PageTemplate';

export default function TutorTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/finance/tutor/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử giao dịch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT_HELD': return { text: 'Nộp cọc nhận lớp', icon: <ArrowUpRight size={16} />, color: 'text-orange-500' };
      case 'DEPOSIT_REFUNDED': return { text: 'Hoàn cọc', icon: <ArrowDownRight size={16} />, color: 'text-green-500' };
      case 'TUTOR_SALARY': return { text: 'Nhận lương', icon: <ArrowDownRight size={16} />, color: 'text-green-500' };
      case 'SALARY_WITHDRAWAL': return { text: 'Rút tiền/Thanh toán', icon: <ArrowUpRight size={16} />, color: 'text-orange-500' };
      case 'FORFEITED': return { text: 'Phạt trừ cọc', icon: <ArrowUpRight size={16} />, color: 'text-red-500' };
      default: return { text: type, icon: <ArrowUpRight size={16} />, color: 'text-gray-500' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-[#e8fadf] text-[#71dd37]">
            <CheckCircle size={12} /> Thành công
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-[#fff8e1] text-[#ffab00]">
            <Clock size={12} /> Đang xử lý
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-[#ffe0db] text-[#ff3e1d]">
            <XCircle size={12} /> Thất bại
          </span>
        );
      default:
        return <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  return (
    <PageTemplate
      title="Lịch sử giao dịch"
      subtitle="Theo dõi thu nhập, nộp cọc và đối soát với trung tâm"
      badge="Finance"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full text-left font-sans text-[#566a7f]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f9f9fa]">
          <div>
            <h3 className="text-lg font-bold">Lịch sử thu chi</h3>
            <p className="text-xs text-[#a1acb8] mt-1">
              Hiển thị các giao dịch nhận lương, hoàn cọc hoặc nộp cọc nhận lớp.
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#a1acb8] text-sm">Đang tải lịch sử giao dịch...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-gray-400 mb-3 flex justify-center">
              <Clock size={48} className="opacity-50" />
            </div>
            <h4 className="text-lg font-bold text-[#566a7f] mb-1">Chưa có giao dịch nào</h4>
            <p className="text-sm text-[#a1acb8]">
              Bạn chưa phát sinh giao dịch nộp cọc hay nhận lương nào trên hệ thống.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f9f9fa] border-b border-gray-100 text-xs font-bold text-[#566a7f] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Thời gian</th>
                  <th className="px-6 py-4 text-left">Loại giao dịch</th>
                  <th className="px-6 py-4 text-right">Số tiền</th>
                  <th className="px-6 py-4 text-left">Trạng thái</th>
                  <th className="px-6 py-4 text-left">Nội dung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((txn) => {
                  const typeLabel = getTransactionTypeLabel(txn.type);
                  const isPositive = ['DEPOSIT_REFUNDED', 'TUTOR_SALARY'].includes(txn.type);
                  
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#566a7f]">
                          {new Date(txn.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-[#a1acb8]">
                          {new Date(txn.createdAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md bg-opacity-10 flex-shrink-0 ${typeLabel.color.replace('text-', 'bg-')} ${typeLabel.color}`}>
                            {typeLabel.icon}
                          </div>
                          <span className="font-semibold">{typeLabel.text}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isPositive ? 'text-[#71dd37]' : 'text-[#ff3e1d]'}>
                          {isPositive ? '+' : '-'}{Number(txn.amount).toLocaleString('vi-VN')}đ
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(txn.status)}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {txn.reference || 'Không có mô tả'}
                        {txn.class && txn.class.student?.fullName && (
                          <div className="text-[10px] text-[#a1acb8] mt-1 uppercase">
                            HS: {txn.class.student.fullName}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
