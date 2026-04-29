-- SQL DDL for lupus-sokr Database Schema

CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10)
);

CREATE TABLE lab_results (
    result_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    test_name VARCHAR(100),
    test_date DATE,
    result_value VARCHAR(100),
    units VARCHAR(50)
);

CREATE TABLE disease_activity (
    activity_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    assessment_date DATE,
    score INT
);

CREATE TABLE follow_ups (
    follow_up_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    follow_up_date DATE,
    notes TEXT
);

CREATE TABLE risk_alerts (
    alert_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    alert_date DATE,
    alert_type VARCHAR(100),
    description TEXT
);

CREATE TABLE medications (
    medication_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    medication_name VARCHAR(100),
    dosage VARCHAR(50),
    start_date DATE,
    end_date DATE
);

CREATE TABLE flares (
    flare_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    flare_date DATE,
    severity VARCHAR(50),
    description TEXT
);

CREATE TABLE comorbidities (
    comorbidity_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    condition_name VARCHAR(100),
    diagnosis_date DATE
);