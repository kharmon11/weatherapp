export default function Spinner() {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
            <defs>
                {/* Gradient for cups */}
                <radialGradient id="cupGradient" cx="0.3" cy="0.3" r="0.7" fx="0.4" fy="0.4">
                    <stop offset="0%" stopColor="#fff8b3"/>
                    {/*light highlight */}
                    <stop offset="60%" stopColor="#ffec66"/>
                    {/* mid tone */}
                    <stop offset="100%" stopColor="#e6c800"/>
                    {/* shadow */}
                </radialGradient>
            </defs>

            <g>
                {/* Center circle with flat yellow fill */}
                <path d="M50 45 A5 5 0 0 1 50 55 A5 5 0 0 1 50 45" stroke="orange" strokeWidth="2" fill="yellow"/>

                {/* Cups with gradient fill */}
                <path d="M50 75.5 A5 5 0 0 1 50 97" stroke="orange" fill="url(#cupGradient)" strokeWidth="2"/>
                <path d="M27.92 37.24 A5 5 0 0 1 9.31 26.49" stroke="orange" fill="url(#cupGradient)" strokeWidth="2"/>
                <path d="M72.08 37.24 A5 5 0 0 1 90.69 26.49" stroke="orange" fill="url(#cupGradient)"
                      strokeWidth="2"/>

                {/* Arms */}
                <path d="M50 55 L50 98" stroke="orange" strokeWidth="2"/>
                <path d="M45.67 47.5 L8.45 26" stroke="orange" strokeWidth="2"/>
                <path d="M54.33 47.5 L91.55 26" stroke="orange" strokeWidth="2"/>

                {/* Rotation animation */}
                <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from="0 50 50"
                    to="-360 50 50"
                    dur="1s"
                    repeatCount="indefinite"/>
            </g>
        </svg>


    )
}