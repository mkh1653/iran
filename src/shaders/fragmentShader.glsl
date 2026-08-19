uniform float uTime;
varying float vH;
varying float vB;
varying float vMorph;

void main() {
    // coverting the point from rectangular to circular shape
    vec2 c = gl_PointCoord - vec2(0.5);
    if (dot(c, c) > 0.25) discard;

    // creating colors pollet
    vec3 green = vec3(0.06, 0.55, 0.28);
    vec3 deep  = vec3(0.02, 0.28, 0.16);
    vec3 white = vec3(0.96, 0.97, 0.94);
    vec3 red   = vec3(0.86, 0.13, 0.18);

    // change color base of height (vh)
    vec3 terrain = mix(deep, green, smoothstep(0.00, 0.30, vH));
    terrain = mix(terrain, red, smoothstep(0.34, 0.68, vH));
    terrain = mix(terrain, white, smoothstep(0.72, 0.96, vH));

    // change color base of lighting (vB)
    vec3 bust = mix(deep, green, smoothstep(0.05, 0.35, vB));
    bust = mix(bust, red, smoothstep(0.35, 0.62, vB));
    bust = mix(bust, white, smoothstep(0.62, 0.92, vB));

    // mix colors on scroll
    vec3 col = mix(terrain, bust, vMorph);

    gl_FragColor = vec4(col, 0.92);
}