import { useState, useEffect } from "react";
import { db } from "./firebase";

import DoctorDashboard from "./DoctorDashboard";
import ReceptionDisplay from "./ReceptionDisplay";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";


function App() {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  const [doctor, setDoctor] = useState("Doctor 1");

  const rooms = {
    "Doctor 1": "Room 1",
    "Doctor 2": "Room 2",
    "Doctor 3": "Room 3"
  };

  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState("login");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchedPatient, setSearchedPatient] = useState(null);

  const loadPatients = async () => {
    try {
      const snapshot = await getDocs(collection(db, "patients"));
      const list = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));
      setPatients(list);
    }
    catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Atomically reserve the next token number using a Firestore transaction.
  // This avoids two registrations getting the same token when they happen
  // around the same time.
  const getNextToken = async () => {
    const counterRef = doc(db, "meta", "tokenCounter");

    const newToken = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      const current = counterSnap.exists() ? counterSnap.data().value : 0;
      const next = current + 1;
      transaction.set(counterRef, { value: next });
      return next;
    });

    return newToken;
  };

  const registerPatient = async () => {
    if (!name || !phone || !age) {
      alert("Please fill all details");
      return;
    }

    try {
      const newToken = await getNextToken();

      await addDoc(collection(db, "patients"), {
        token: newToken,
        name: name,
        phone: phone,
        age: age,
        doctor: doctor,
        room: rooms[doctor],
        status: "Waiting",
        visitDate: new Date().toLocaleDateString(),
        visitTime: new Date().toLocaleTimeString(),
        createdAt: serverTimestamp()
      });

      alert("Patient Registered. Token: " + newToken);

      setName("");
      setPhone("");
      setAge("");

      loadPatients();
    }
    catch (error) {
      console.log(error);
      alert("Registration failed");
    }
  };

  // Search Old Patient
  const searchPatient = async () => {
    if (!searchPhone) {
      alert("Enter phone number");
      return;
    }

    const snapshot = await getDocs(collection(db, "patients"));
    const found = snapshot.docs.find(
      item => item.data().phone === searchPhone
    );

    if (found) {
      setSearchedPatient({ id: found.id, ...found.data() });
    }
    else {
      alert("Patient not found");
      setSearchedPatient(null);
    }
  };

  // Generate New Token For Old Patient
  const generateNewToken = async () => {
    if (!searchedPatient) {
      alert("Search patient first");
      return;
    }

    const newToken = await getNextToken();

    await updateDoc(doc(db, "patients", searchedPatient.id), {
      token: newToken,
      status: "Waiting",
      visitDate: new Date().toLocaleDateString(),
      visitTime: new Date().toLocaleTimeString()
    });

    alert("New Token: " + newToken);

    setSearchedPatient(null);
    setSearchPhone("");
    loadPatients();
  };

  const callNextPatient = async () => {
    const patient = patients
      .filter(
        p => p.doctor === selectedDoctor && p.status === "Waiting"
      )
      .sort(
        (a, b) => Number(a.token) - Number(b.token)
      )[0];

    if (!patient) {
      alert("No waiting patient");
      return;
    }

    await updateDoc(doc(db, "patients", patient.id), {
      status: "In Progress",
      calledAt: serverTimestamp()
    });

    loadPatients();
  };

  // Doctor Page
  if (page === "doctor") {
    return (
      <DoctorDashboard
        doctor={selectedDoctor}
        patients={patients}
        callNextPatient={callNextPatient}
      />
    );
  }

  // Display Page
  if (page === "display") {
    return (<ReceptionDisplay />);
  }

  // Login Page
  if (page === "login") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          fontFamily: "Arial"
        }}
      >
        <h1>Pearl Dental Care</h1>
        <h3>Clinic Management System</h3>

        <br />

        <button onClick={() => setPage("reception")}>
          Reception Login
        </button>

        <br /><br />

        <button
          onClick={() => {
            setSelectedDoctor("Doctor 1");
            setPage("doctor");
          }}
        >
          Doctor 1 Login
        </button>

        <br /><br />

        <button
          onClick={() => {
            setSelectedDoctor("Doctor 2");
            setPage("doctor");
          }}
        >
          Doctor 2 Login
        </button>

        <br /><br />

        <button
          onClick={() => {
            setSelectedDoctor("Doctor 3");
            setPage("doctor");
          }}
        >
          Doctor 3 Login
        </button>

        <br /><br />

        <button onClick={() => setPage("display")}>
          Patient Display
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Arial",
        background: "#f5f5f5",
        minHeight: "100vh",
        padding: "30px"
      }}
    >
      <h1 style={{ color: "#0077b6" }}>Pearl Dental Care</h1>
      <h2>Reception Dashboard</h2>

      <button
        onClick={() => {
          setSelectedDoctor("Doctor 1");
          setPage("doctor");
        }}
      >
        Open Doctor 1 Dashboard
      </button>

      <br /><br />

      <button
        onClick={() => {
          setSelectedDoctor("Doctor 2");
          setPage("doctor");
        }}
      >
        Open Doctor 2 Dashboard
      </button>

      <br /><br />

      <button
        onClick={() => {
          setSelectedDoctor("Doctor 3");
          setPage("doctor");
        }}
      >
        Open Doctor 3 Dashboard
      </button>

      <br /><br />

      <button onClick={() => setPage("display")}>
        Open Patient Display
      </button>

      <hr />

      <h2>Register New Patient</h2>

      <input
        placeholder="Patient Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <br /><br />

      <select
        value={doctor}
        onChange={(e) => setDoctor(e.target.value)}
      >
        <option>Doctor 1</option>
        <option>Doctor 2</option>
        <option>Doctor 3</option>
      </select>

      <br /><br />

      <button onClick={registerPatient}>
        Register Patient
      </button>

      <hr />

      <h2>Search Existing Patient</h2>

      <input
        placeholder="Enter Phone Number"
        value={searchPhone}
        onChange={(e) => setSearchPhone(e.target.value)}
      />

      <br /><br />

      <button onClick={searchPatient}>
        Search Patient
      </button>

      {searchedPatient &&
        <div
          style={{
            background: "#fff",
            padding: "15px",
            border: "1px solid #0077b6"
          }}
        >
          <h3>Patient Found</h3>
          <p>Name: {searchedPatient.name}</p>
          <p>Phone: {searchedPatient.phone}</p>
          <p>Age: {searchedPatient.age}</p>
          <p>Last Token: {searchedPatient.token}</p>

          <button onClick={generateNewToken}>
            Generate New Token
          </button>
        </div>
      }

      <hr />

      <h2>Patient Records</h2>

      {patients.map(patient => (
        <div
          key={patient.id}
          style={{
            background: "#fff",
            padding: "15px",
            marginTop: "10px",
            border: "1px solid #ccc"
          }}
        >
          <p><strong>Token:</strong> {patient.token}</p>
          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
          <p><strong>Age:</strong> {patient.age}</p>
          <p><strong>Doctor:</strong> {patient.doctor}</p>
          <p><strong>Room:</strong> {patient.room}</p>
          <p><strong>Status:</strong> {patient.status}</p>
          <p><strong>Date:</strong> {patient.visitDate}</p>
          <p><strong>Time:</strong> {patient.visitTime}</p>
        </div>
      ))}

    </div>
  );
}

export default App;