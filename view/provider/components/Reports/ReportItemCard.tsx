import React from 'react';
import { AlertTriangle, ShoppingBag, Package, MessageSquare } from 'lucide-react';
import { Report } from '../../../../types';

interface ReportItemCardProps {
    report: Report;
    onClick: () => void;
}

export const ReportItemCard: React.FC<ReportItemCardProps> = ({ report, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="group relative bg-white dark:bg-stone-900 rounded-[2rem] border-2 border-stone-100 dark:border-stone-800 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] hover:border-red-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row md:items-start gap-6"
        >
            {/* Urgent Indicator Stripe / Glow */}
            {report.isUrgent && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100"></div>
            )}
            {report.isUrgent && (
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500"></div>
            )}

            {/* Icon */}
            <div className={`p-4 rounded-2xl shrink-0 border relative z-10 ${report.isUrgent ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30'}`}>
                <AlertTriangle className="w-6 h-6" />
            </div>

            {/* Main Content Area */}
                    <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-bold text-xs">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {report.date}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                        report.status === 'resolved' 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-orange-50 text-orange-600 border-orange-200'
                    }`}>
                        {report.status}
                    </div>
                    <ChevronRight className="w-6 h-6 text-stone-300 group-hover:text-orange-500 transition-colors hidden md:block" />
                </div>
            </div>
        </div>
    );
};