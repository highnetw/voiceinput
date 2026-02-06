"use client";

import { useState, useEffect, useRef } from "react";

export default function VoiceInputPage() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("준비 완료");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 브라우저 음성 인식 엔진 설정
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.continuous = true;
      recognition.interimResults = true;

      // 여기서 부터 수정 시작 0207 0205
      recognition.onresult = (event: any) => {
        let finalTranscript = ""; // 확정된 문장들
        let interimTranscript = ""; // 지금 말하고 있는 중인 문장

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        // 확정된 문장 뒤에 지금 말하는 중인 문장을 붙여서 실시간으로 보여줍니다.
        // 이 방식은 기존 텍스트에 더하는(prev +) 게 아니라서 중복이 생기지 않습니다.
        setText(finalTranscript + interimTranscript);
      };
      // 여기까지 수정 끝 0207 0205

      recognition.onend = () => {
        setIsListening(false);
        setStatus("인식 종료");
      };

      recognitionRef.current = recognition;
    } else {
      setStatus("이 브라우저는 음성 인식을 지원하지 않습니다.");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setStatus("인식 중단 중...");
    } else {
      // setText(""); // 새로 시작할 때 초기화
      recognitionRef.current?.start();
      setIsListening(true);
      setStatus("🎤 듣고 있습니다... 말씀해 주세요.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    const oldStatus = status;
    setStatus("📋 클립보드에 복사되었습니다!");
    setTimeout(() => setStatus(oldStatus), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-10 bg-slate-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">🎙️ CYKIM 음성 입력기 v1.0</h1>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-4 font-semibold text-gray-600 text-center">{status}</div>

        <textarea
          className="w-full h-64 p-4 text-xl border-2 border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 text-black"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 말씀하신 내용이 나타납니다..."
          spellCheck={false}
        />

        <div className="flex justify-center gap-4">
          <button
            onClick={toggleListening}
            className={`px-8 py-4 rounded-full text-white font-bold text-lg transition-all ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            {isListening ? "⏹️ 인식 중단" : "🎤 음성 인식 시작"}
          </button>

          <button
            onClick={copyToClipboard}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-full text-white font-bold text-lg transition-all"
          >
            📋 복사하기
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm">CYKIM의 개발 비서 Gemini와 함께 만듦</p>
    </main>
  );
}