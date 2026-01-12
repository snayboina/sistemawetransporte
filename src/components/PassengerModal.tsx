import { useState } from 'react';
import { Users, X } from 'lucide-react';

interface PassengerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (count: number) => void;
    busInfo?: string;
}

export default function PassengerModal({ isOpen, onClose, onConfirm, busInfo }: PassengerModalProps) {
    const [passengerCount, setPassengerCount] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        const count = parseInt(passengerCount) || 0;
        onConfirm(count);
        setPassengerCount('');
    };

    const handleSkip = () => {
        onConfirm(0);
        setPassengerCount('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-xl">
                                <Users className="text-primary" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Passageiros
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                    {busInfo && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            ├önibus: <span className="font-semibold">{busInfo}</span>
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Quantos passageiros est├úo no ├┤nibus?
                        </label>
                        <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min="0"
                            value={passengerCount}
                            onChange={(e) => setPassengerCount(e.target.value)}
                            placeholder="Digite a quantidade"
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-semibold text-center focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleConfirm();
                                }
                            }}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                            Pressione Enter ou clique em Confirmar
                        </p>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                        {[10, 20, 30, 40].map((num) => (
                            <button
                                key={num}
                                onClick={() => setPassengerCount(num.toString())}
                                className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-primary/20 hover:text-primary transition-colors"
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={handleSkip}
                        className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Pular
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!passengerCount}
                        className="flex-1 py-3 rounded-xl bg-primary text-black font-medium hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
