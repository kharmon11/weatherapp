import './LocationForm.sass'
import React, {useState} from "react";
import {MdMyLocation} from "react-icons/md";

interface LocationFormProps {
    locationError: string;
    handleSubmit: (location: string) => void;
    handleMyLocation: () => void;
}

export default function LocationForm({locationError, handleSubmit, handleMyLocation}: LocationFormProps) {
    const [location, setLocation] = useState("")

    // Run handleSubmit function to get weather data
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit(location);
    }

    return (
        <form className={"location-form panel"} onSubmit={onSubmit}>
            {locationError && (
                <div className={"geolocation-error"}>{locationError}</div>
            )}
            <div className={"location-form-controls"}>
                <div className={"location-input-wrapper"}>
                    <div className={"location-form-header"}>Enter Location</div>
                    <input
                        id="location-input"
                        className={"location-input"}
                        type="text"
                        placeholder={"city, state, zipcode, etc."}
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                    />
                </div>
                <div className={"location-buttons-wrapper"}>
                    <button id={"location-submit"} type={"submit"}>Submit</button>
                    <button id={"my-location-btn"} type={"button"} onClick={handleMyLocation}><MdMyLocation/>My Location
                    </button>
                </div>
            </div>
        </form>
    )
}