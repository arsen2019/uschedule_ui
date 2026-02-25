import React, { useEffect, useState } from "react";
import {createRoute} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";

type TimeSlot = "09:00" | "14:00" | "19:00" | "22:00";

interface DayRecord {
  day: string;
  values: Record<TimeSlot, number | null>;
}

export const trackerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/track',
    component: Dashboard
});
interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

const timeSlots: TimeSlot[] = ["09:00", "14:00", "19:00", "22:00"];

const GREETINGS = [
  "Beautiful consistency 🍸",
  "Smooth progress today ✨",
  "Elite discipline 💪",
  "Momentum is real 🔥",
  "Strong finish 👏",
];

const getTodayString = () =>
  new Date().toISOString().split("T")[0];

const getDefaultTimeSlot = (): TimeSlot => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const map: Record<TimeSlot, number> = {
    "09:00": 540,
    "14:00": 840,
    "19:00": 1140,
    "22:00": 1320,
  };

  let selected: TimeSlot = "09:00";
  for (const slot of timeSlots) {
    if (minutes >= map[slot]) selected = slot;
  }
  return selected;
};

const formatDisplayDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

function Dashboard () {
  const [records, setRecords] = useState<DayRecord[]>(() => {
    const saved = localStorage.getItem("daily-tracker");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTime, setSelectedTime] =
    useState<TimeSlot>(getDefaultTimeSlot());
  const [value, setValue] = useState("");
  const [selectedDate, setSelectedDate] =
    useState(getTodayString());

  const [celebration, setCelebration] =
    useState<string | null>(null);
  const [confetti, setConfetti] = useState<
    ConfettiPiece[]
  >([]);

  useEffect(() => {
    localStorage.setItem(
      "daily-tracker",
      JSON.stringify(records)
    );
  }, [records]);

  const isDayComplete = (record: DayRecord) =>
    timeSlots.every((slot) => record.values[slot] !== null);

  const generateConfetti = () => {
    const pieces: ConfettiPiece[] = [];

    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = 200 + Math.random() * 400;

      pieces.push({
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 6 + Math.random() * 8,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        duration: 900 + Math.random() * 600,
      });
    }

    setConfetti(pieces);

    setTimeout(() => {
      setConfetti([]);
    }, 2000);
  };

  const triggerCelebration = () => {
    const random =
      GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setCelebration(random);
    generateConfetti();

    setTimeout(() => setCelebration(null), 3000);
  };

  const exportCSV = () => {
    let csv = "Day," + timeSlots.join(",") + "\n";
    records.forEach((r) => {
      csv +=
        r.day +
        "," +
        timeSlots.map((t) => r.values[t] ?? "").join(",") +
        "\n";
    });

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "daily-tracker.csv";
    link.click();
  };

  const handleSubmit = () => {
    if (!value) return;

    setRecords((prev) => {
      const updated = [...prev];
      let record = updated.find(
        (r) => r.day === selectedDate
      );

      if (!record) {
        record = {
          day: selectedDate,
          values: {
            "09:00": null,
            "14:00": null,
            "19:00": null,
            "22:00": null,
          },
        };
        updated.push(record);
      }

      record.values[selectedTime] = parseFloat(value);

      if (
        selectedTime === "22:00" &&
        isDayComplete(record)
      ) {
        triggerCelebration();
      }

      return updated.sort(
        (a, b) =>
          new Date(b.day).getTime() -
          new Date(a.day).getTime()
      );
    });

    setValue("");
  };

  return (
    <div style={containerStyle}>
      {celebration && (
        <>
          <FloatingPopup message={celebration} />
          {confetti.map((piece) => (
            <div
              key={piece.id}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                width: piece.size,
                height: piece.size,
                background: piece.color,
                borderRadius: "50%",
                pointerEvents: "none",
                transform: `translate(${piece.x}px, ${piece.y}px)`,
                transition: `transform ${piece.duration}ms ease-out, opacity ${piece.duration}ms`,
                opacity: 0,
              }}
            />
          ))}
        </>
      )}

      <div style={cardStyle}>
        <h2 style={titleStyle}>📊 Casual Tracker</h2>

        <div style={inputWrapper}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
            style={inputStyle}
          />

          <select
            value={selectedTime}
            onChange={(e) =>
              setSelectedTime(
                e.target.value as TimeSlot
              )
            }

            style={selectStyle}
          >
            {timeSlots.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="Enter value"
            value={value}
            onChange={(e) =>
              setValue(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter")
                handleSubmit();
            }}
            style={inputStyle}
          />

          <button
            onClick={handleSubmit}
            style={buttonStyle}
          >
            Save Entry
          </button>

          <button
            onClick={exportCSV}
            style={exportStyle}
          >
            Export CSV
          </button>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Day</th>
              {timeSlots.map((t) => (
                <th key={t} style={thStyle}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.day}>
                <td style={tdStyle}>
                  {formatDisplayDate(r.day)}
                </td>
                {timeSlots.map((t) => (
                  <td key={t} style={tdStyle}>
                    {r.values[t] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* Improved Styles */
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6f8",
  padding: "20px",
  fontFamily: "Inter, sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "600px",
  background: "#ffffff",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  color: "#1f2937",
};

const titleStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "25px",
  color: "#111827",
};

const inputWrapper: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginBottom: "25px",
};

const inputStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  color: "#111827",
  background: "#ffffff",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  color:"black",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 500,
};

const exportStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  background: "#10b981",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 500,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#ffffff",
  color:"gray"
};

const thStyle: React.CSSProperties = {
  padding: "12px",
  background: "#f3f4f6",
  borderBottom: "2px solid #e5e7eb",
  color: "#374151",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb",
  color: "#111827",
};




const FloatingPopup = ({
  message,
}: {
  message: string;
}) => (
  <div
    style={{
      position: "fixed",
      top: "15%",
      background: "#7aa6a1",
      color: "white",
      padding: "18px 28px",
      borderRadius: "20px",
      fontWeight: 600,
    }}
  >
    🎉 {message}
  </div>
);

export default Dashboard;