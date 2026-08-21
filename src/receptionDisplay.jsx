import { useState, useEffect, useRef } from "react";
import { db } from "./Firebase";

import {
  collection,
  getDocs
} from "firebase/firestore";


function ReceptionDisplay() {

  const [currentPatient, setCurrentPatient] = useState(null);
  const [waitingCount, setWaitingCount] = useState(0);

  const spokenPatient = useRef(null);

  const loadPatient = async () => {
    try {
      const snapshot = await getDocs(collection(db, "patients"));

      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const waiting = patients.filter(p => p.status === "Waiting");
      setWaitingCount(waiting.length);

      const calling = patients.find(p => p.status === "In Progress");
      setCurrentPatient(calling || null);
    }
    catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadPatient();

    const timer = setInterval(loadPatient, 3000);

    return () => clearInterval(timer);
  }, []);

  // Voice only for new token
  useEffect(() => {
    if (!currentPatient) {
      return;
    }

    const patientKey = currentPatient.id + "-" + currentPatient.status;

    if (spokenPatient.current === patientKey) {
      return;
    }

    spokenPatient.current = patientKey;

    const message = `Token number ${currentPatient.token}, please go to ${currentPatient.room}`;

    const speech = new SpeechSynthesisUtterance(message);

    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);

  }, [currentPatient]);

  return (
    <div
      style={{
        textAlign: "center",
        background: "#001219",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial"
      }}
    >
      <h1 style={{ color: "#00b4d8" }}>
        Pearl Dental Care
      </h1>

      <h2>
        NOW SERVING
      </h2>

      {
        currentPatient ?

          <>
            <h1
              style={{
                fontSize: "200px",
                fontWeight: "bold",
                color: "#00b4d8"
              }}
            >
              {currentPatient.token}
            </h1>

            <h2>
              Room : {currentPatient.room}
            </h2>

            <h2>
              Patient : {currentPatient.name}
            </h2>
          </>

          :

          <h2>
            Waiting for next patient...
          </h2>
      }

      <h3>
        Waiting Patients : {waitingCount}
      </h3>
    </div>
  );
}

export default ReceptionDisplay;