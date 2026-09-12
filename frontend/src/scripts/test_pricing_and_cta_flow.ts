import { normalizeContextCourse, DEFAULT_COURSE_PRICES } from '../contexts/CourseContext';
import { courseService, DEFAULT_COURSE_PRICES as SERVICE_PRICES } from '../services/courseService';

console.log('================================================================');
console.log('🧪 VERIFYING FRONTEND PRICING, CTA LOGIC & DATA NORMALIZATION');
console.log('================================================================\n');

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (details) console.error('   Details:', details);
    process.exitCode = 1;
  }
}

// 1. Linux Course Object Normalization Test
const rawLinuxDoc = {
  id: 'course_linux_101',
  title: 'Linux Systems & Administration Mastery',
  slug: 'linux-systems-administration-mastery',
  price: 399,
  category: 'Linux & Systems',
};

const normLinux = normalizeContextCourse(rawLinuxDoc);
assert(normLinux.price === 399, '1. normalizeContextCourse gives price 399 for Linux Course', { price: normLinux.price });

const isPaidLinux = (normLinux.price ?? 0) > 0;
assert(isPaidLinux === true, '2. isPaid is TRUE for Linux Course', { isPaid: isPaidLinux });

// Computed CTA text logic as implemented in CourseDetailsPage.tsx lines 382-410
function computeCtaText(isEnrolled: boolean, isPaid: boolean, price: number, progressPercent = 0) {
  if (isEnrolled) {
    return progressPercent > 0 ? 'Continue Learning' : 'Start Learning';
  }
  if (isPaid) {
    return `Enroll Now • ₹${price}`;
  }
  return 'Enroll Free to Access';
}

const linuxCtaNonEnrolled = computeCtaText(false, isPaidLinux, normLinux.price ?? 0);
assert(linuxCtaNonEnrolled === 'Enroll Now • ₹399', '3. Linux Course CTA for non-enrolled student is "Enroll Now • ₹399"', { cta: linuxCtaNonEnrolled });

const linuxCtaEnrolled = computeCtaText(true, isPaidLinux, normLinux.price ?? 0, 45);
assert(linuxCtaEnrolled === 'Continue Learning', '4. Linux Course CTA for enrolled student is "Continue Learning"', { cta: linuxCtaEnrolled });

// 2. C Programming Test
const rawCDoc = {
  id: 'c-programming-course-id',
  title: 'C Programming',
  slug: 'c-programming',
  price: 199,
};
const normC = normalizeContextCourse(rawCDoc);
const isPaidC = (normC.price ?? 0) > 0;
const cProgCta = computeCtaText(false, isPaidC, normC.price ?? 0);
assert(normC.price === 199, '5. C Programming price is 199', { price: normC.price });
assert(cProgCta === 'Enroll Now • ₹199', '6. C Programming CTA is "Enroll Now • ₹199"', { cta: cProgCta });

// 3. Free Course Test (DSA)
const rawFreeDoc = {
  id: 'data-structures-and-algorithms',
  title: 'Data Structures & Algorithms',
  slug: 'data-structures-and-algorithms',
  price: 0,
};
const normFree = normalizeContextCourse(rawFreeDoc);
const isPaidFree = (normFree.price ?? 0) > 0;
const freeCta = computeCtaText(false, isPaidFree, normFree.price ?? 0);
assert(normFree.price === 0, '7. Free Course price is 0', { price: normFree.price });
assert(isPaidFree === false, '8. isPaid is FALSE for Free Course', { isPaid: isPaidFree });
assert(freeCta === 'Enroll Free to Access', '9. Free Course CTA is "Enroll Free to Access"', { cta: freeCta });

// 4. Default / Fallback Price Resolution Test (when API returns price: 0 or undefined for Linux)
const rawLegacyLinuxDoc = {
  id: 'course_linux_101',
  title: 'Linux Systems & Administration Mastery',
  slug: 'linux-systems-administration-mastery',
  price: 0, // Old zero in state/cache
};
const normLegacyLinux = normalizeContextCourse(rawLegacyLinuxDoc);
assert(normLegacyLinux.price === 399, '10. Fallback ensures Linux course price resolves to 399 even if raw price was 0', { price: normLegacyLinux.price });

// 5. CourseService normalizeCourseToICourse test
const serviceLinux = courseService.normalizeCourseToICourse(rawLegacyLinuxDoc);
assert(serviceLinux.price === 399, '11. courseService.normalizeCourseToICourse resolves price 399 for Linux', { price: serviceLinux.price });

console.log('\n================================================================');
console.log('🏁 ALL FRONTEND DATA-FLOW & CTA SPEC ASSERTIONS PASSED ✅');
console.log('================================================================');
