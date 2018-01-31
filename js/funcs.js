const sleep = t => new Promise(res => setTimeout(res, t)); 

const getScale = z => {
	const VD = innerWidth * 0.5 / Math.tan(((game.settings.FOV / 360) * 0.5) * Math.PI * 2);
	//TODO: calculate view distance from field of view
	return VD / Math.abs(z === 0? 1 : z);
} 

const getProjected = pos => {
  const relPos = pos.clone()
    .substract(game.state.player.position)
    .rotateY(game.state.player.phi)
    .rotateX(game.state.player.theta);
  const scale = getScale(relPos.z);
  const behind = relPos.z <= 0;
  const x = innerWidth / 2 + scale * relPos.x;
  const y = innerHeight / 2 + scale * relPos.y;
	const z = relPos.z;
  return { x, y, z, scale, behind };
};

const rayPointDistance = (rayStart, rayDirection, point) => {
	const rp = point.clone().substract(rayStart);//relative position of point when ray starts from the origo
	const rpn = rp.clone().normalize();//rp as normalized
	const angle = Math.acos(rayDirection.clone().normalize().dot(rpn));//observing from the origo: angle between the point and rayDirection
	return angle >= Math.PI / 2? rayStart.distance(point) : rp.length * Math.sin(angle);//if point is "behind" the rayStart, use rayStart distance to point, else use angle and hypothenuse to get the catet
};

const segmentPointDistance = (a, b, point) => {
	const ray = b.clone().substract(a).normalize();
	const dist1 = rayPointDistance(a, ray, point);
	const dist2 = rayPointDistance(b, ray.scale(-1), point);
	return Math.max(dist1, dist2);
};

const getSpheresIntersectingRay = (rayStart, rayDirection, spheres) => {
	return spheres.filter(s => rayPointDistance(rayStart, rayDirection, s.position) <= s.r);
};

const getClosestSphereIntersectingRay = (rayStart, rayDirection, spheres) => {
	const intersecting = getSpheresIntersectingRay(rayStart, rayDirection, spheres);
	const ordered = intersecting.sort((s1, s2) => {
		return rayStart.sqDistance(s1.position) - rayStart.sqDistance(s2.position);
	});
	return ordered[0];
};

const getSpheresIntersectingSegment = (a, b, spheres) => {
	return spheres.filter(s => segmentPointDistance(a, b, s.position) <= s.r);
};

const getClosestSegmentIntersectingSphere = (a, b, spheres) => {
	const intersecting = getSpheresIntersectingSegment(a, b, spheres);
	const ordered = intersecting.sort((s1, s2) => {
		return a.sqDistance(s1.position) - a.sqDistance(s2.position);
	});
	return ordered[0];
};

const vectorFromAngles = (aY, aX, l = 1) => {
	return (new V3(0, 0, l)).rotateX(aX).rotateY(aY);
}

const mixColors = (a, b, rawRatio = 0.5) => {
	const ratio = Math.max(Math.min(rawRatio, 1), 0);
	const arrA = a.split("").filter(e => e != "#").map(e =>  parseInt(e, 16) * (1 - ratio));
	const arrB = b.split("").filter(e => e != "#").map(e =>  parseInt(e, 16) * ratio);
	const arrMix = arrA.map((num, i) => Math.max(0, Math.min(15, Math.round(num + arrB[i]))).toString(16));
	return "#" + arrMix.join("");
}

const brightness = (hex, amount) => {
	const str = hex.split("").filter(e => e != "#").map(e => (Math.max(0, Math.min(15, Math.round(parseInt(e, 16) + amount * 15)))).toString(16)).join("");
	return "#" + str;
}
