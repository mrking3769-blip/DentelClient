import { useState, useEffect } from "react";
import { db } from "./Firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

function DoctorDashboard({ doctor }) {
  const [patients, setPatients] = useState([]);

  const loadPatients = async () => {
    const querySnapshot = await getDocs(collection(db, "patients"));

    const patientList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPatients(patientList);
  };

  useEffect(() => {
    loadPatients();

    const interval = setInterval(loadPatients, 3000);

    return () => clearInterval(interval);
  }, []);

  const completePatient = async (id) => {
    await updateDoc(doc(db, "patients", id), {
      status: "Completed",
    });

    loadPatients();
  };

  const callNextPatient = async () => {
    // Sort by token so patients are called in the order they registered,
    // not just whatever order Firestore happens to return them in.
    const nextPatient = patients
      .filter(
        (patient) =>
          patient.status === "Waiting" &&
          patient.doctor === doctor
      )
      .sort((a, b) => Number(a.token) - Number(b.token))[0];

    if (!nextPatient) {
      alert("No waiting patients");
      return;
    }

    await updateDoc(doc(db, "patients", nextPatient.id), {
      status: "In Progress",
      calledAt: new Date(),
    });

    alert("Calling Token: " + nextPatient.token);

    loadPatients();
  };

  const doctorPatients = patients.filter(
    (patient) =>
      patient.doctor === doctor &&
      patient.status !== "Completed"
  );

  const waitingCount = doctorPatients.filter(
    (patient) =>
      patient.status === "Waiting"
  ).length;

  return (
    <div
      style={{
        fontFamily: "Arial",
        backgroundColor: "#eef7ff",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#0077b6" }}>
        Pearl Dental Care
      </h1>

      <h2>{doctor} Dashboard</h2>

      <h3>
        Waiting Patients: {waitingCount}
      </h3>

      <button
        onClick={callNextPatient}
        style={{
          backgroundColor: "#28a745",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Call Next Patient
      </button>

      <br />
      <br />

      {doctorPatients.map((patient) => (
        <div
          key={patient.id}
          style={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "15px",
            marginTop: "10px",
            borderRadius: "5px",
          }}
        >
          <p><b>Token:</b> {patient.token}</p>
          <p><b>Name:</b> {patient.name}</p>
          <p><b>Age:</b> {patient.age}</p>
          <p><b>Phone:</b> {patient.phone}</p>
          <p>
            <b>Status:</b> {patient.status}
          </p>

          {patient.status === "In Progress" && (
            <button
              onClick={() => completePatient(patient.id)}
            >
              Complete Patient
            </button>
          )}
        </div>
      ))}

    </div>
  );
}

export default DoctorDashboard;