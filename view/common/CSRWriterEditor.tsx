
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, Share2, Loader2, Copy, Check, Save, Edit3, Send, Search, LayoutGrid, List, Hash, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { db } from '../../services/db';
import { contentWriter } from '../../services/contentWriter';
import { UserData, FoodItem } from '../../types';
import { toast } from '../common/ToastContext';

interface CSRWriterEditorProps {
    currentUser: UserData | null;
    foodItems: FoodItem[];
    onBack: () => void;
}

export const CSRWriterEditor: React.FC<CSRWriterEditorProps> = ({ currentUser, foodItems, onBack }) => {
    const [selectedFoodId, setSelectedFoodId] = useState<string>(foodItems[0]?.id || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editableContent, setEditableContent] = useState('');
    const [resultTitle, setResultTitle] = useState('');
    const [hooks, setHooks] = useState<string[]>([]);
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [copiedHook, setCopiedHook] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // New Features: Tone, Platform, & Lang
    const [selectedTone, setSelectedTone] = useState('Inspirational');
    const [selectedPlatform, setSelectedPlatform] = useState('Instagram/Social');
    const [selectedLang, setSelectedLang] = useState('ID');
    const [selectedPov, setSelectedPov] = useState<'donor' | 'receiver' | 'both'>('donor');
    const [editableContentDonor, setEditableContentDonor] = useState('');
    const [editableContentReceiver, setEditableContentReceiver] = useState('');

    const tones = [
        { name: 'Inspirational', icon: '✨' },
        { name: 'Professional', icon: '👔' },
        { name: 'Data-Driven', icon: '📊' },
        { name: 'Emotional', icon: '❤️' }
    ];

    const platforms = [
        { name: 'Instagram/Social', icon: '📱' },
        { name: 'LinkedIn/Professional', icon: '🤝' },
        { name: 'Press Release/Formal', icon: '📄' }
    ];

    const filteredItems = useMemo(() => {
        return foodItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [foodItems, searchTerm]);

    const handleGenerate = async () => {
        const product = foodItems.find(f => f.id === selectedFoodId);
        if (!product) return toast.info("Pilih produk untuk mendapatkan konteks dampak.");

        setIsGenerating(true);
        try {
            const result = await contentWriter.writeCSR({
                foodName: product.name,
                donorName: currentUser?.name || "Perusahaan Kami",
                impactPoints: Math.round(Math.random() * 500 + 100), 
                co2Saved: parseFloat((Math.random() * 30 + 5).toFixed(1)),
                tone: selectedTone,
                platform: selectedPlatform,
                language: selectedLang === 'ID' ? 'Indonesian' : 'English',
                pov: selectedPov
            }, currentUser?.role || 'corporate_donor');
            
            setResultTitle(`Impact Report: ${product.name}`);
            if (selectedPov === 'both') {
                setEditableContentDonor(result.mainCopyDonor || result.mainCopy || '');
                setEditableContentReceiver(result.mainCopyReceiver || '');
                setEditableContent('');
            } else {
                setEditableContent(result.mainCopy || '');
                setEditableContentDonor('');
                setEditableContentReceiver('');
            }
            setHooks(result.hooks || []);
            setHashtags(result.hashtags || []);
            setIsEditing(true);
        } catch (e: any) {
            toast.info(e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!currentUser?.id) return;
        if (selectedPov !== 'both' && !editableContent) return;
        if (selectedPov === 'both' && !editableContentDonor && !editableContentReceiver) return;
        
        setIsSaving(true);
        try {
            await db.saveCorporateAIResult({
                donorId: currentUser.id,
                foodId: selectedFoodId ? Number(selectedFoodId) : 0,
                type: 'CSR_COPY',
                title: resultTitle,
                content: JSON.stringify({
                    narrative: selectedPov === 'both' ? { donor: editableContentDonor, receiver: editableContentReceiver } : editableContent,
                    metadata: {
                        tone: selectedTone,
                        platform: selectedPlatform,
                        lang: selectedLang,
                        pov: selectedPov
                    }
                })
            });
            toast.success("Berhasil disimpan ke riwayat Anda!");
        } catch (e: any) {
            toast.info(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyHookToClipboard = (hook: string, idx: number) => {
        navigator.clipboard.writeText(hook);
        setCopiedHook(idx);
        setTimeout(() => setCopiedHook(null), 2000);
    };

    const useHookAsMain = (hook: string) => {
        if (selectedPov === 'both') {
            setEditableContentDonor(hook);
        } else {
            setEditableContent(hook);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-stone-950 flex flex-col md:max-w-6xl md:mx-auto md:relative md:h-[95vh] md:rounded-[3rem] md:shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <header className="p-6 flex items-center justify-between bg-white/80 dark:bg-stone-950/80 backdrop-blur-md sticky top-0 z-10 border-b border-stone-100 dark:border-stone-900">
                <button 
                    onClick={onBack}
                    className="p-3 bg-stone-100 dark:bg-stone-900 rounded-2xl text-stone-600 dark:text-stone-300 active:scale-90 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center flex-1">
                    <h2 className="text-xl font-black text-stone-900 dark:text-white leading-none tracking-tight uppercase italic flex items-center justify-center gap-2">
                        <Share2 className="w-5 h-5 text-pink-500" /> CSR Copywriter
                    </h2>
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] mt-1">Impact Storyteller AI</p>
                </div>
                <div className="w-11"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Controls (5/12) */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* 1. Konteks Produk */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em]">01. Konteks Produk</h3>
                                <div className="flex bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200/50 dark:border-stone-800">
                                    <button 
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-stone-800 shadow-sm text-pink-600' : 'text-stone-400'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-stone-800 shadow-sm text-pink-600' : 'text-stone-400'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input 
                                    type="text"
                                    placeholder="Cari Menu..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 focus:outline-none text-sm font-bold transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                {filteredItems.length === 0 ? (
                                    <p className="text-[10px] text-stone-400 font-black uppercase text-center border-2 border-dashed border-stone-100 dark:border-stone-800 rounded-[2rem] py-12">Menu tidak ditemukan.</p>
                                ) : (
                                    <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                                        {filteredItems.map(f => (
                                            <button 
                                                key={f.id}
                                                onClick={() => setSelectedFoodId(f.id)}
                                                className={`relative transition-all group overflow-hidden rounded-[2rem] border-2 ${viewMode === 'grid' ? 'aspect-square' : 'p-3 flex items-center gap-4'} ${selectedFoodId === f.id ? 'border-pink-500 shadow-xl shadow-pink-500/10' : 'border-stone-100 dark:border-stone-800 hover:border-pink-200 dark:hover:border-pink-900'}`}
                                            >
                                                <div className={`${viewMode === 'grid' ? 'absolute inset-0' : 'w-14 h-14 rounded-2xl'} overflow-hidden`}>
                                                    <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                                {viewMode === 'grid' && <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/10 transition-colors" />}
                                                
                                                <div className={`${viewMode === 'grid' ? 'absolute inset-x-0 bottom-0 p-3 bg-white/40 dark:bg-black/40 backdrop-blur-md border-t border-white/20 dark:border-white/5' : 'flex-1 text-left'}`}>
                                                    <p className={`text-[10px] font-black uppercase line-clamp-2 leading-tight ${viewMode === 'grid' ? 'text-stone-900 dark:text-white' : 'text-stone-900 dark:text-white'}`}>{f.name}</p>
                                                </div>
                                                
                                                {selectedFoodId === f.id && (
                                                    <div className={`${viewMode === 'grid' ? 'absolute top-3 right-3' : 'ml-auto'} bg-pink-500 p-1 rounded-lg shadow-lg`}>
                                                        <Check className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Style & Language Selection */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em]">02. Nada Bicara</h3>
                                <div className="flex flex-col gap-2">
                                    {tones.map(tone => (
                                        <button
                                            key={tone.name}
                                            onClick={() => setSelectedTone(tone.name)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedTone === tone.name ? 'bg-stone-950 dark:bg-white text-white dark:text-stone-900 border-stone-950 dark:border-white shadow-lg' : 'bg-white dark:bg-stone-900 text-stone-500 border-stone-100 dark:border-stone-800 hover:border-pink-200'}`}
                                        >
                                            <span className="text-sm">{tone.icon}</span>
                                            {tone.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em]">03. Bahasa</h3>
                                <div className="flex bg-stone-100 dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-200/50 dark:border-stone-800">
                                    <button 
                                        onClick={() => setSelectedLang('ID')}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${selectedLang === 'ID' ? 'bg-white dark:bg-stone-800 text-pink-600 shadow-sm' : 'text-stone-400'}`}
                                    >
                                        INDONESIA
                                    </button>
                                    <button 
                                        onClick={() => setSelectedLang('EN')}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${selectedLang === 'EN' ? 'bg-white dark:bg-stone-800 text-pink-600 shadow-sm' : 'text-stone-400'}`}
                                    >
                                        ENGLISH
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 4. Target Platform */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em]">04. Platform Target</h3>
                            <div className="flex flex-wrap gap-2">
                                {platforms.map(p => (
                                    <button
                                        key={p.name}
                                        onClick={() => setSelectedPlatform(p.name)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedPlatform === p.name ? 'bg-pink-600 text-white border-pink-600 shadow-xl shadow-pink-500/20' : 'bg-white dark:bg-stone-900 text-stone-500 border-stone-100 dark:border-stone-800 hover:border-pink-200'}`}
                                    >
                                        <span className="text-sm">{p.icon}</span>
                                        {p.name.split('/')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 5. POV */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em]">05. Sudut Pandang (POV)</h3>
                            <div className="grid grid-cols-3 gap-2 bg-stone-100 dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-200/50 dark:border-stone-800">
                                <button 
                                    onClick={() => setSelectedPov('donor')}
                                    className={`py-3 px-2 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all ${selectedPov === 'donor' ? 'bg-white dark:bg-stone-800 text-pink-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    DONATUR
                                </button>
                                <button 
                                    onClick={() => setSelectedPov('receiver')}
                                    className={`py-3 px-2 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all ${selectedPov === 'receiver' ? 'bg-white dark:bg-stone-800 text-pink-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    PENERIMA
                                </button>
                                <button 
                                    onClick={() => setSelectedPov('both')}
                                    className={`py-3 px-2 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all ${selectedPov === 'both' ? 'bg-white dark:bg-stone-800 text-pink-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                                >
                                    KEDUANYA
                                </button>
                            </div>
                        </div>


                        <Button 
                            onClick={handleGenerate}
                            disabled={isGenerating || foodItems.length === 0}
                            className="w-full h-16 bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 bg-[length:200%_100%] hover:bg-right transition-all duration-700 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-pink-500/20 active:scale-95"
                        >
                            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-5 h-5 mr-3" /> Tulis Impact Story</>}
                        </Button>
                    </div>

                    {/* Editor Area (7/12) */}
                    <div className="lg:col-span-7 space-y-6">
                        {!isEditing ? (
                            <div className="h-full min-h-[600px] border-2 border-dashed border-stone-100 dark:border-stone-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 space-y-6 bg-stone-50/30 dark:bg-stone-900/10">
                                <div className="w-24 h-24 bg-white dark:bg-stone-900 rounded-[3rem] shadow-xl border border-stone-100 dark:border-stone-800 flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Share2 className="w-10 h-10 text-stone-200 group-hover:text-pink-500 group-hover:scale-110 transition-all duration-500" />
                                </div>
                                <div className="max-w-xs space-y-3">
                                    <h4 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-tight italic">Be a Social Storyteller</h4>
                                    <p className="text-[11px] text-stone-400 font-medium leading-relaxed">
                                        Pilih menu makanan, nada bicara, dan POV. AI kami akan merangkai narasi dampak lingkungan dan sosial perusahaan Anda.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in zoom-in-95 duration-700">
                                {/* Editor Header */}
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                                            <Edit3 className="w-4 h-4 text-pink-600" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">AI Narrative Editor</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => copyToClipboard(selectedPov === 'both' ? editableContentDonor + '\n\n' + editableContentReceiver : editableContent)} className="p-3 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl text-stone-500 transition-all border border-stone-100 dark:border-stone-800">
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Main Textareas */}
                                {selectedPov === 'both' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative group space-y-2">
                                            <h4 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em] ml-2">POV: Donatur</h4>
                                            <textarea 
                                                value={editableContentDonor}
                                                onChange={(e) => setEditableContentDonor(e.target.value)}
                                                className="w-full min-h-[340px] p-6 rounded-[2rem] bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 focus:outline-none text-stone-800 dark:text-stone-200 text-sm leading-relaxed font-medium transition-all shadow-xl"
                                                placeholder="Narasi dari sisi donatur..."
                                            />
                                        </div>
                                        <div className="relative group space-y-2">
                                            <h4 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em] ml-2">POV: Penerima</h4>
                                            <textarea 
                                                value={editableContentReceiver}
                                                onChange={(e) => setEditableContentReceiver(e.target.value)}
                                                className="w-full min-h-[340px] p-6 rounded-[2rem] bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 focus:outline-none text-stone-800 dark:text-stone-200 text-sm leading-relaxed font-medium transition-all shadow-xl"
                                                placeholder="Narasi dari sisi penerima..."
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <textarea 
                                            value={editableContent}
                                            onChange={(e) => setEditableContent(e.target.value)}
                                            className="w-full min-h-[340px] p-10 rounded-[3rem] bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 focus:outline-none text-stone-800 dark:text-stone-200 text-base leading-relaxed font-medium transition-all shadow-xl"
                                            placeholder="Menenun narasi dampak Anda..."
                                        />
                                        <div className="absolute top-8 right-8 w-12 h-12 bg-pink-50 dark:bg-pink-900/10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:rotate-12">
                                            <Sparkles className="w-6 h-6 text-pink-500" />
                                        </div>
                                    </div>
                                )}

                                {/* Social Hooks Panel */}
                                {hooks.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                                                <Zap className="w-3.5 h-3.5 text-rose-500" />
                                            </div>
                                            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Social Hooks Alternatif</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {hooks.map((hook, idx) => (
                                                <div key={idx} className="group/hook flex items-start gap-3 p-5 rounded-[2rem] bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:border-pink-200 dark:hover:border-pink-900 transition-all">
                                                    <span className="mt-0.5 w-6 h-6 flex-shrink-0 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-[9px] font-black">{idx + 1}</span>
                                                    <p className="flex-1 text-[11px] text-stone-600 dark:text-stone-300 font-medium leading-relaxed">{hook}</p>
                                                    <div className="flex gap-1.5 opacity-0 group-hover/hook:opacity-100 transition-opacity flex-shrink-0">
                                                        <button
                                                            onClick={() => copyHookToClipboard(hook, idx)}
                                                            className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors"
                                                            title="Salin hook"
                                                        >
                                                            {copiedHook === idx ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                        <button
                                                            onClick={() => useHookAsMain(hook)}
                                                            className="p-2 rounded-xl bg-pink-600 text-white transition-colors"
                                                            title="Gunakan sebagai narasi utama"
                                                        >
                                                            <Zap className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Hashtags Panel */}
                                {hashtags.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-7 h-7 rounded-xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                                                <Hash className="w-3.5 h-3.5 text-violet-500" />
                                            </div>
                                            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Hashtags Rekomendasi</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2 px-1">
                                            {hashtags.map((tag, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setEditableContent(prev => prev + '\n' + tag)}
                                                    className="px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-[10px] font-black hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all"
                                                >
                                                    {tag.startsWith('#') ? tag : `#${tag}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <Button 
                                        onClick={handleSave} 
                                        isLoading={isSaving}
                                        className="flex-1 h-16 bg-stone-950 dark:bg-white text-white dark:text-stone-950 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                                    >
                                        <Save className="w-4 h-4 mr-3" /> Simpan Ke Riwayat
                                    </Button>
                                    <Button className="flex-1 h-16 bg-gradient-to-r from-pink-600 via-rose-500 to-rose-600 rounded-[2rem] text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-pink-500/20 active:scale-95 transition-all">
                                        <Send className="w-4 h-4 mr-3" /> Publish Story
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
