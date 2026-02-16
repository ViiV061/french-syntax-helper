"use client";
import { useState } from "react";
import {
  BookOpen,
  Sparkles,
  X,
  ArrowRight,
  Eraser,
  Quote,
  Loader2,
  Languages,
  BookType,
} from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeWord, setActiveWord] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setActiveWord(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: input }),
      });
      const data = await response.json();
      if (data.status === "error") {
        setError(data.message);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("网络请求失败，请检查连接。");
    } finally {
      setLoading(false);
    }
  };

  const renderInteractiveSentence = (sentence, keywords) => {
    if (!keywords || keywords.length === 0) return sentence;
    let parts = [sentence];

    keywords.forEach((keyword) => {
      if (!keyword.word) return;
      const newParts = [];
      parts.forEach((part) => {
        if (typeof part !== "string") {
          newParts.push(part);
          return;
        }
        const regex = new RegExp(`(${keyword.word})`, "gi");
        const split = part.split(regex);
        split.forEach((s) => {
          if (s.toLowerCase() === keyword.word.toLowerCase()) {
            newParts.push(
              <span
                key={Math.random()}
                onClick={() => setActiveWord(keyword)}
                className="group relative cursor-pointer inline-block mx-1 align-middle"
              >
                <span className="px-2 py-0.5 font-bold text-black bg-neutral-100 rounded-md border border-neutral-200 transition-all duration-200 group-hover:bg-black group-hover:text-white group-hover:border-black">
                  {s}
                </span>
              </span>,
            );
          } else {
            if (s) newParts.push(s);
          }
        });
      });
      parts = newParts;
    });
    return <div className="leading-loose tracking-wide">{parts}</div>;
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 font-sans selection:bg-black selection:text-white bg-white text-slate-900">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-neutral-100">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-1.5 rounded-md">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-black">
              法语结构透视助手
            </h1>
          </div>
          <span className="text-[10px] font-mono border border-neutral-200 px-2 py-0.5 rounded text-neutral-400">
            CIT693 PROTOTYPE
          </span>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-6 md:px-8 lg:px-12 mt-8 md:mt-12 space-y-12 flex-grow">
        <section className="space-y-4">
          <div
            className={`bg-white border border-neutral-200 rounded-xl transition-all duration-300 p-6 md:p-8 shadow-sm ${error ? "border-red-500 ring-1 ring-red-500" : "focus-within:border-black focus-within:ring-1 focus-within:ring-black"}`}
          >
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Input Source
              </label>
              {input && (
                <button
                  onClick={() => setInput("")}
                  className="text-xs flex items-center gap-1 text-neutral-400 hover:text-black transition-colors"
                >
                  <Eraser size={14} /> CLEAR
                </button>
              )}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入法语内容，例如：Je suis allé au cinéma."
              className="w-full text-xl md:text-2xl font-medium text-black placeholder:text-neutral-200 bg-transparent focus:outline-none resize-none h-32"
              maxLength={100}
            />

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-neutral-100">
              <span
                className={`text-xs font-mono ${input.length > 90 ? "text-red-600" : "text-neutral-300"}`}
              >
                {input.length} / 100 CHARS
              </span>

              <button
                onClick={handleAnalyze}
                disabled={loading || !input}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 bg-black text-white border border-transparent hover:bg-neutral-800 hover:shadow-lg active:scale-95 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> ANALYZING
                  </>
                ) : (
                  <>
                    ANALYZE STRUCTURE <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 text-sm text-red-600 font-medium px-2">
              ● {error}
            </div>
          )}
        </section>

        {loading && (
          <div className="space-y-8 animate-pulse">
            <div className="h-24 bg-neutral-100 rounded-xl w-full"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-40 bg-neutral-100 rounded-xl"></div>
              <div className="h-40 bg-neutral-100 rounded-xl"></div>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-6 py-4">
              <div className="text-2xl md:text-4xl font-serif text-black">
                {renderInteractiveSentence(
                  result.source_sentence,
                  result.keywords,
                )}
              </div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Tap highlighted words to expand
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Chinese */}
              <div className="space-y-4">
                <div className="h-px w-8 bg-black mb-4"></div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Chinese Meaning
                </h4>
                <p className="text-xl text-neutral-800 font-medium leading-relaxed">
                  {result.chinese_translation}
                </p>
              </div>

              {/* English */}
              <div className="bg-black text-white p-8 rounded-2xl shadow-2xl shadow-neutral-200 space-y-8 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-neutral-800 opacity-20 text-9xl font-serif select-none pointer-events-none">
                  &
                </div>

                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                    Structure Pivot (English)
                  </h4>
                  <p className="text-xl font-medium leading-relaxed pb-2">
                    {result.english_analysis.literal_translation}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-800">
                  <div className="flex gap-3 items-start text-neutral-300 text-sm">
                    <span className="text-xs font-bold border border-neutral-700 px-1.5 rounded text-neutral-500 mt-0.5">
                      EN
                    </span>
                    <p className="leading-relaxed">
                      {result.english_analysis.grammar_explanation_en ||
                        result.english_analysis.grammar_explanation}
                    </p>
                  </div>

                  <div className="flex gap-3 items-start text-neutral-300 text-sm">
                    <span className="text-xs font-bold border border-neutral-700 px-1.5 rounded text-neutral-500 mt-0.5">
                      CN
                    </span>
                    <p className="leading-relaxed">
                      {result.english_analysis.grammar_explanation_cn ||
                        "暂无中文解析"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- Modal --- */}
      {activeWord && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setActiveWord(null)}
          ></div>

          <div className="relative bg-white w-full md:w-[480px] md:rounded-2xl rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 overflow-hidden">
            <div className="bg-neutral-50 px-8 py-6 border-b border-neutral-100 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-black capitalize font-serif">
                  {activeWord.word}
                </h3>
                <span className="inline-block mt-2 text-[10px] font-bold text-white bg-black px-2 py-0.5 rounded uppercase">
                  {activeWord.type}
                </span>
              </div>
              <button
                onClick={() => setActiveWord(null)}
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-neutral-100 active:bg-neutral-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  Analysis
                </h4>
                <p className="text-neutral-700 leading-relaxed">
                  {activeWord.explanation}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 border-b border-neutral-100 pb-2">
                  Variation Examples
                </h4>
                {activeWord.examples.map((ex, i) => (
                  <div key={i} className="group grid gap-1">
                    <div className="flex gap-3 items-baseline">
                      <BookType
                        size={14}
                        className="text-neutral-300 shrink-0"
                      />
                      <p className="text-black font-medium text-lg">{ex.fr}</p>
                    </div>
                    <div className="pl-7 space-y-1">
                      {/* 中文翻译加粗显示 */}
                      <p className="text-black font-bold text-xs bg-neutral-100 inline-block px-1.5 rounded">
                        {ex.cn}
                      </p>
                      <p className="text-neutral-400 text-xs italic">{ex.en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
