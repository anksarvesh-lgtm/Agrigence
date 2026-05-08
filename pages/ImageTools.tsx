import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, Sparkles, Settings2, Maximize, FileImage, Trash2, SlidersHorizontal, ArrowRight, CheckCircle, RefreshCcw, Shield } from 'lucide-react';
import SEO from '../components/SEO';

type Extension = 'image/jpeg' | 'image/png' | 'image/webp';

interface ImageFile {
  originalFile: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  
  processedBlob: Blob | null;
  processedUrl: string | null;
  processedSize: number | null;
  
  // Settings
  quality: number;
  format: Extension;
  targetWidth: number;
  targetHeight: number;
  maintainAspectRatio: boolean;
}

const PRESETS = [
  { name: 'Original', width: 0, height: 0 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'Twitter/X Post', width: 1200, height: 675 },
  { name: 'WhatsApp Image', width: 800, height: 800 },
  { name: 'Website Banner', width: 1920, height: 1080 },
  { name: 'Thumbnail', width: 1280, height: 720 },
  { name: 'Passport (600x600)', width: 600, height: 600 },
];

const COMPRESSION_PRESETS = [
  { name: 'Low Compression (High Quality)', value: 0.9 },
  { name: 'Medium Compression (Balanced)', value: 0.7 },
  { name: 'High Compression (Small Size)', value: 0.4 },
];

const ImageTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compress' | 'resize'>('compress');
  const [image, setImage] = useState<ImageFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetSizeKB, setTargetSizeKB] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(async (currentImage: ImageFile) => {
    if (!currentImage.previewUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = currentImage.previewUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = currentImage.targetWidth;
      canvas.height = currentImage.targetHeight;

      if (currentImage.format === 'image/jpeg' || currentImage.format === 'image/webp') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, currentImage.format, currentImage.quality);
      });

      if (blob) {
        setImage(prev => {
          if (!prev) return null;
          if (prev.processedUrl) URL.revokeObjectURL(prev.processedUrl);
          return {
            ...prev,
            processedBlob: blob,
            processedUrl: URL.createObjectURL(blob),
            processedSize: blob.size
          };
        });
      }
    } catch (e) {
      console.error('Error processing image:', e);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const autoCompressToTarget = useCallback(async () => {
      if (!image || !targetSizeKB) return;
      const targetBytes = parseFloat(targetSizeKB) * 1024;
      if (isNaN(targetBytes) || targetBytes <= 0) return;
      
      setIsProcessing(true);
      let minQ = 0.01;
      let maxQ = 1.0;
      let bestQ = 0.8;
      let iterations = 0;
      let bestBlob: Blob | null = null;
      let lastDiff = Infinity;
      
      try {
          const img = new Image();
          img.src = image.previewUrl;
          await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
          });
          const canvas = document.createElement('canvas');
          canvas.width = image.targetWidth;
          canvas.height = image.targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('No context');
          
          if (image.format === 'image/jpeg' || image.format === 'image/webp') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          while (iterations < 8) {
              let midQ = (minQ + maxQ) / 2;
              const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, image.format, midQ));
              if (!blob) break;
              
              const diff = Math.abs(blob.size - targetBytes);
              if (diff < lastDiff || blob.size <= targetBytes) {
                  bestQ = midQ;
                  bestBlob = blob;
                  lastDiff = diff;
              }
              
              if (Math.abs(blob.size - targetBytes) < targetBytes * 0.02) {
                  break; // within 2% margin
              } else if (blob.size > targetBytes) {
                  maxQ = midQ; // need smaller size, lower quality
              } else {
                  minQ = midQ; // need larger size, increase quality
              }
              iterations++;
          }
          
          if (bestBlob) {
              const finalBlob = bestBlob;
              setImage(prev => {
                  if(!prev) return null;
                  if(prev.processedUrl) URL.revokeObjectURL(prev.processedUrl);
                  return {
                      ...prev,
                      quality: bestQ,
                      processedBlob: finalBlob,
                      processedUrl: URL.createObjectURL(finalBlob),
                      processedSize: finalBlob.size
                  };
              });
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
  }, [image, targetSizeKB]);

  useEffect(() => {
    if (image && !isProcessing) {
      const timeoutId = setTimeout(() => {
        processImage(image);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [image?.quality, image?.targetWidth, image?.targetHeight, image?.format]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = previewUrl;
    
    img.onload = () => {
      setImage({
        originalFile: file,
        previewUrl,
        originalWidth: img.width,
        originalHeight: img.height,
        originalSize: file.size,
        processedBlob: null,
        processedUrl: null,
        processedSize: null,
        quality: 0.8,
        format: file.type as Extension || 'image/jpeg',
        targetWidth: img.width,
        targetHeight: img.height,
        maintainAspectRatio: true,
      });
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePresetChange = (preset: typeof PRESETS[0]) => {
    if (!image) return;
    if (preset.width === 0) {
      setImage({ ...image, targetWidth: image.originalWidth, targetHeight: image.originalHeight });
      return;
    }
    
    let newWidth = preset.width;
    let newHeight = preset.height;
    
    if (image.maintainAspectRatio && preset.width > 0 && preset.height > 0) {
        // Fit within preset bounds while maintaining aspect ratio
        const ratio = Math.min(preset.width / image.originalWidth, preset.height / image.originalHeight);
        newWidth = Math.round(image.originalWidth * ratio);
        newHeight = Math.round(image.originalHeight * ratio);
    }
    
    setImage({ ...image, targetWidth: newWidth, targetHeight: newHeight });
  };

  const handleWidthChange = (val: string) => {
      if (!image) return;
      const newWidth = parseInt(val) || 0;
      let newHeight = image.targetHeight;
      if (image.maintainAspectRatio && newWidth > 0) {
          newHeight = Math.round(newWidth * (image.originalHeight / image.originalWidth));
      }
      setImage({ ...image, targetWidth: newWidth, targetHeight: newHeight });
  };

  const handleHeightChange = (val: string) => {
      if (!image) return;
      const newHeight = parseInt(val) || 0;
      let newWidth = image.targetWidth;
      if (image.maintainAspectRatio && newHeight > 0) {
          newWidth = Math.round(newHeight * (image.originalWidth / image.originalHeight));
      }
      setImage({ ...image, targetWidth: newWidth, targetHeight: newHeight });
  };

  const downloadImage = () => {
    if (!image?.processedUrl || !image?.processedBlob) return;
    const a = document.createElement('a');
    a.href = image.processedUrl;
    const ext = image.format.split('/')[1];
    a.download = `agrigence-optimized-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const calculateReduction = () => {
      if(!image?.processedSize || !image?.originalSize) return 0;
      const reduction = ((image.originalSize - image.processedSize) / image.originalSize) * 100;
      return reduction > 0 ? reduction.toFixed(1) : 0;
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <SEO 
        title="Free Image Compressor & Resizer | Agrigence"
        description="Compress, enhance, and resize images easily without losing quality. Free online image utility for agriculture professionals and researchers."
        keywords="image compressor, image resizer, resize photo online, compress jpeg, optimize webp, agrigence tools"
      />

      <div className="bg-white border-b border-stone-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-widest uppercase rounded-full mb-4 border border-emerald-100">
                    <Sparkles size={12} /> Pro-Grade Free Tool
                </div>
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 mb-4 tracking-tight">
                    Smart Image Optimizer
                </h1>
                <p className="text-stone-500 font-medium sm:text-lg">
                    Compress, resize, and convert images instantly without uploading to deep servers. 100% secure, everything happens in your browser.
                </p>
            </div>
          </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!image ? (
          <div className="max-w-3xl mx-auto">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300
                ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.02] shadow-xl' : 'border-stone-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 shadow-sm'}
              `}
            >
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
                <Upload size={32} />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-2">Drop your image here</h3>
              <p className="text-stone-500 font-medium mb-6">or click to browse from your device</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">JPG</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">PNG</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">WEBP</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12 text-center">
                <div className="bg-white p-6 rounded-2xl border border-stone-200">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4"><SlidersHorizontal size={20}/></div>
                    <h4 className="font-bold text-stone-900">Zero Quality Loss</h4>
                    <p className="text-sm text-stone-500 mt-2">Smart algorithms reduce file size while maintaining crystal clear visual fidelity.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-stone-200">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Maximize size={20}/></div>
                    <h4 className="font-bold text-stone-900">Custom Resizing</h4>
                    <p className="text-sm text-stone-500 mt-2">Scale down dimensions perfectly for web platforms and official forms.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-stone-200">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Shield size={20}/></div>
                    <h4 className="font-bold text-stone-900">100% Private</h4>
                    <p className="text-sm text-stone-500 mt-2">Images never leave your device. All processing happens locally in your browser.</p>
                </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left: Settings Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm sticky top-24 relative overflow-hidden">
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                      <RefreshCcw className="animate-spin text-emerald-500 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Processing...</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-4">
                  <h3 className="font-bold text-stone-900 flex items-center gap-2">
                    <Settings2 size={18} className="text-emerald-500"/> Optimization Settings
                  </h3>
                  <button 
                    onClick={() => setImage(null)}
                    className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-xl transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* TABS */}
                <div className="flex p-1 bg-stone-100 rounded-2xl mb-8">
                    <button 
                        onClick={() => setActiveTab('compress')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'compress' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        Compress
                    </button>
                    <button 
                        onClick={() => setActiveTab('resize')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'resize' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        Resize
                    </button>
                </div>

                {activeTab === 'compress' && (
                    <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3 block">Output Format</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['image/jpeg', 'image/png', 'image/webp'].map((fmt) => {
                                    const shortFmt = fmt.split('/')[1].toUpperCase();
                                    return (
                                        <button 
                                            key={fmt}
                                            onClick={() => setImage({ ...image, format: fmt as Extension })}
                                            className={`py-2 rounded-xl text-xs font-bold transition-all border ${image.format === fmt ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}
                                        >
                                            {shortFmt}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Quality</label>
                                <span className="text-sm font-black text-emerald-600">{Math.round(image.quality * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.1" max="1" step="0.05"
                                value={image.quality}
                                onChange={(e) => setImage({...image, quality: parseFloat(e.target.value)})}
                                className="w-full accent-emerald-500 cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2">Quick Presets</label>
                            {COMPRESSION_PRESETS.map((preset, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setImage({...image, quality: preset.value})}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${image.quality === preset.value ? 'bg-emerald-500 text-white shadow-md' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-stone-100 space-y-3">
                             <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block">Compress to Target Size (KB)</label>
                             <div className="flex gap-2">
                                <input 
                                    type="number"
                                    placeholder="Enter target e.g. 50"
                                    value={targetSizeKB}
                                    onChange={(e) => setTargetSizeKB(e.target.value)}
                                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 font-mono text-sm text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                />
                                <button 
                                    onClick={autoCompressToTarget}
                                    disabled={!targetSizeKB || isProcessing}
                                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                                >
                                    Apply
                                </button>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'resize' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Width (px)</label>
                                <input 
                                    type="number" 
                                    value={image.targetWidth}
                                    onChange={(e) => handleWidthChange(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 font-mono text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div className="text-stone-300 pb-3"><Maximize size={16}/></div>
                            <div className="flex-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Height (px)</label>
                                <input 
                                    type="number" 
                                    value={image.targetHeight}
                                    onChange={(e) => handleHeightChange(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 font-mono text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200">
                            <input 
                                type="checkbox" 
                                checked={image.maintainAspectRatio}
                                onChange={(e) => setImage({...image, maintainAspectRatio: e.target.checked})}
                                className="w-5 h-5 accent-emerald-500 rounded"
                            />
                            <span className="text-sm font-medium text-stone-700">Maintain Aspect Ratio</span>
                        </label>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-3">Popular Sizes</label>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESETS.map((preset, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handlePresetChange(preset)}
                                        className="text-left px-3 py-2 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 text-stone-600 hover:text-emerald-700 rounded-xl transition-all"
                                    >
                                        <div className="text-xs font-bold leading-tight">{preset.name}</div>
                                        {preset.width > 0 && <div className="text-[10px] text-stone-400 font-mono mt-0.5">{preset.width}x{preset.height}</div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
              </div>
            </div>

            {/* Right: Preview & Download */}
            <div className="lg:col-span-8 flex flex-col space-y-6">
                
                {/* Visual Preview */}
                <div className="bg-stone-300 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center relative min-h-[400px] border border-stone-200 checkerboard-bg">
                    {/* Checkerboard CSS class defined in styles if transparent, or inline here */}
                    <style>{`
                        .checkerboard-bg {
                            background-image: linear-gradient(45deg, #e5e5f7 25%, transparent 25%), linear-gradient(-45deg, #e5e5f7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5f7 75%), linear-gradient(-45deg, transparent 75%, #e5e5f7 75%);
                            background-size: 20px 20px;
                            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                        }
                    `}</style>
                    
                    {image.processedUrl ? (
                         <img 
                            src={image.processedUrl} 
                            alt="Optimized Preview" 
                            className="max-w-full max-h-[600px] object-contain drop-shadow-2xl transition-all"
                        />
                    ) : (
                        <div className="animate-pulse text-stone-400 flex flex-col items-center">
                            <FileImage size={48} className="mb-4 opacity-50" />
                            <span className="text-sm font-medium uppercase tracking-widest">Generating Preview...</span>
                        </div>
                    )}
                </div>

                {/* Stats & Actions */}
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-stone-100 pb-2">Results Overview</div>
                        
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-stone-500">Original Size:</span>
                            <span className="font-mono text-stone-900 line-through decoration-red-400/50">{formatFileSize(image.originalSize)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium text-stone-500">Optimized Size:</span>
                            <span className="font-mono text-Emerald-600 font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{formatFileSize(image.processedSize || 0)}</span>
                        </div>
                        
                        {calculateReduction() !== 0 && (
                            <div className="mt-2 pt-4 border-t border-stone-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={14}/> Space Saved</span>
                                <span className="text-xl font-black text-emerald-500">{calculateReduction()}%</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs font-mono text-stone-400 mt-4 bg-stone-50 p-2 rounded-xl justify-center">
                            <span>{image.originalWidth}x{image.originalHeight}</span>
                            <ArrowRight size={12} />
                            <span className="text-emerald-600 font-bold">{image.targetWidth}x{image.targetHeight}</span>
                        </div>
                    </div>

                    <div className="bg-emerald-900 p-8 rounded-3xl shadow-xl flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 text-emerald-800 opacity-50">
                            <Sparkles size={120} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-2 relative z-10">Ready to Download</h3>
                        <p className="text-emerald-100/80 text-sm mb-8 relative z-10">Optimized {image.format.split('/')[1].toUpperCase()} image prepared successfully.</p>
                        
                        <button 
                            onClick={downloadImage}
                            disabled={!image.processedUrl}
                            className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black uppercase tracking-widest py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 relative z-10"
                        >
                            <Download size={20} />
                            Download Image
                        </button>
                    </div>
                </div>
            </div>
            
          </div>
        )}
      </div>
      
      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <h3 className="text-2xl font-serif font-bold text-center mb-10">Frequently Asked Questions</h3>
          <div className="space-y-4">
              {[
                  { q: "Is my image uploaded to your servers?", a: "No. This tool operates 100% locally in your web browser. Your images never leave your device, ensuring complete privacy." },
                  { q: "Why should I compress images?", a: "Compressing images reduces file size, which makes uploading to websites faster, saves storage space, and is often required by official forms or journals." },
                  { q: "What is the best format to use?", a: "WEBP offers the best compression for web use. JPG is best for photographs, and PNG is best for graphics with transparent backgrounds." },
              ].map((faq, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200">
                      <h4 className="font-bold text-stone-900 mb-2">{faq.q}</h4>
                      <p className="text-stone-600 text-sm">{faq.a}</p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default ImageTools;
