// @/components/CreatePet

"use client";
import React from "react";
import { useEffect, useState } from "react";

interface PetData {
  name: string;
  dispenser: dictionary<string>;
}

const CreatePet = () => {
  const [petData, setPetData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pet")
      .then((res) => res.json())
      .then((data) => {
        setPetData(data);
  }, []);

  return (
    <div>
      <h1>Create a Pet</h1>
      <form>
        <label>
          Name:
          <input type="text" name="name" />
        </label>
        <button type="submit">Create Pet</button>
      </form>
    </div>
  );


});

export default CreatePet;
