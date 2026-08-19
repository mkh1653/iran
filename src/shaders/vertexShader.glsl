attribute float aH;
attribute float aSeed;
attribute vec3 aTB;
attribute float aB;

uniform float uTime;
uniform float uSize;
uniform float uMorph;
uniform float uR;

varying float vH;
varying float vB;
varying float vMorph;

void main() {
    vH = aH;
    vB = aB;
    
    float morph = clamp(uMorph, 0.0, 1.0);
    vMorph = morph;

    float stagger = clamp((morph - aSeed * 0.3) / 0.7, 0.0, 1.0);
    
    // animation of the vertex position based on the morph value and the seed (map is showing)
    float r = clamp(uR, 0.0, 1.0);
    vec3 pMap = position;
    pMap.y *= r;

    // mixing the position of the vertex between the map and the target position based on the stagger value
    vec3 p = mix(pMap, aTB, stagger);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // setting the point size based on the vertex height and the stagger value
    float s = uSize * mix(0.55 + aH * 1.15, 0.5 + aB * 1.2, stagger);
    gl_PointSize = s * (140.0 / -mv.z);
}