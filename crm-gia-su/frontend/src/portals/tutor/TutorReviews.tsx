import { useState, useEffect } from 'react';
import { Star, MessageSquareQuote } from 'lucide-react';
import api from '../../services/api';
import PageTemplate from '../../components/PageTemplate';

export default function TutorReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/crm/tutor/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Lỗi khi tải đánh giá', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <PageTemplate
      title="Đánh giá & Phản hồi"
      subtitle="Xem các nhận xét từ phụ huynh và học sinh về quá trình giảng dạy"
      badge="Reviews"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full text-left font-sans text-[#566a7f] p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h3 className="text-lg font-bold">Thống kê Đánh giá</h3>
            <p className="text-xs text-[#a1acb8] mt-1">
              Phản hồi từ phụ huynh giúp bạn cải thiện chất lượng giảng dạy.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#f9f9fa] p-4 rounded-xl border border-gray-100">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#ffab00] flex items-center gap-2">
                {getAverageRating()} <Star size={24} className="fill-[#ffab00]" />
              </div>
              <div className="text-xs text-[#a1acb8] font-semibold uppercase mt-1">Trung bình</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-[#696cff]">{reviews.length}</div>
              <div className="text-xs text-[#a1acb8] font-semibold uppercase mt-1">Lượt đánh giá</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-[#a1acb8] text-sm">Đang tải đánh giá...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#f9f9fa] rounded-xl border border-dashed border-gray-200">
              <div className="text-gray-400 mb-3 flex justify-center">
                <MessageSquareQuote size={48} className="opacity-50" />
              </div>
              <h4 className="text-lg font-bold text-[#566a7f] mb-1">Chưa có đánh giá nào</h4>
              <p className="text-sm text-[#a1acb8]">
                Bạn sẽ nhận được đánh giá sau khi hoàn thành các khóa học hoặc trong quá trình dạy.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-[#566a7f]">{review.parent?.fullName || 'Phụ huynh ẩn danh'}</div>
                      <div className="text-xs text-[#a1acb8] uppercase font-semibold mt-0.5">
                        Lớp của HS: {review.class?.student?.fullName || 'Không rõ'}
                      </div>
                    </div>
                    <div className="flex text-[#ffab00]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? "fill-[#ffab00]" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-[#697a8d] bg-[#f9f9fa] p-3 rounded-lg italic">
                    "{review.comment || 'Không có nhận xét chi tiết.'}"
                  </div>
                  <div className="text-[10px] text-[#a1acb8] font-semibold text-right">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}
