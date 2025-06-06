import './LocationForm.sass'
import React from "react";
import {MdMyLocation} from "react-icons/md";

interface LocationFormProps {
    location: string;
    handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleMyLocation: () => void;
}

export default function LocationForm({location, handleInput, handleSubmit, handleMyLocation}: LocationFormProps) {

    return (
        <form className={"location-form panel"} onSubmit={handleSubmit}>
            <div className={"location-form-header"}>Enter Location</div>
            <input id="location-input" className={"location-input"} type="text" placeholder={"Enter Location"}
                   value={location}
                   onChange={handleInput}/>
            <button id={"location-submit"} type={"submit"}>Submit</button>
            <button id={"my-location-btn"} type={"button"} onClick={handleMyLocation}><MdMyLocation/>My Location
            </button>
        </form>
    )
}