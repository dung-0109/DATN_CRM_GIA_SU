import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRITICAL UI ERROR]', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-[#ffe0db] text-[#ff3e1d] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={32} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#566a7f]">Đã xảy ra sự cố hiển thị</h2>
              <p className="text-xs text-[#a1acb8] mt-1.5 leading-relaxed">
                Hệ thống gặp lỗi không mong muốn khi dựng giao diện trang này.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-left text-xs font-mono text-[#ff3e1d] overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-2.5 px-4 bg-[#f5f5f9] hover:bg-gray-200 text-[#566a7f] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home size={14} /> Về trang chủ
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} /> Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
