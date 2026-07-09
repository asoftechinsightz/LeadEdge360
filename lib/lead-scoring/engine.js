export function calculateLeadScore(lead) {

  let score = 0
  const reasons = []

  /*
   * Industry Score
   */
  const industryWeights = {
    'Real Estate': 20,
    'Healthcare': 17,
    'Hospital': 17,
    'Dental Clinic': 16,
    'Restaurant & Cafe': 14,
    'Restaurant': 14,
    'Gym & Fitness': 14,
    'Gym': 14,
    'Salon & Beauty': 12,
    'Salon': 12,
    'Retail Store': 10,
    'Retail': 10,
    'Interior Design': 18,
    'Interior Designer': 18,
    'Architect': 18,
    'Education & Coaching': 12,
    'Manufacturing': 11,
  }

  const industry =
    lead.industry ||
    lead.category ||
    lead.primaryType ||
    ''

  const industryScore =
    industryWeights[industry] || 8

  score += industryScore
  reasons.push(`Industry:${industryScore}`)

  /*
   * Rating Score
   */
  const rating = Number(lead.rating || 0)

  if (rating >= 4.8) {
    score += 20
    reasons.push('Rating:20')
  } else if (rating >= 4.5) {
    score += 16
    reasons.push('Rating:16')
  } else if (rating >= 4.0) {
    score += 12
    reasons.push('Rating:12')
  } else if (rating > 0) {
    score += 6
    reasons.push('Rating:6')
  }

  /*
   * Reviews Score
   */
  const reviews = Number(
    lead.reviews ||
    lead.userRatingsTotal ||
    0
  )

  if (reviews >= 500) {
    score += 20
    reasons.push('Reviews:20')
  } else if (reviews >= 200) {
    score += 15
    reasons.push('Reviews:15')
  } else if (reviews >= 50) {
    score += 10
    reasons.push('Reviews:10')
  } else if (reviews > 0) {
    score += 5
    reasons.push('Reviews:5')
  }

  /*
   * Website Score
   */
  if (lead.website) {
    score += 10
    reasons.push('Website:10')
  }

  /*
   * Phone Score
   */
  if (lead.phone) {
    score += 10
    reasons.push('Phone:10')
  }

  /*
   * Google Profile Score
   */
  if (lead.googleUrl) {
    score += 5
    reasons.push('GoogleProfile:5')
  }

  /*
   * Business Status
   */
  if (
    lead.businessStatus === 'OPERATIONAL'
  ) {
    score += 5
    reasons.push('Operational:5')
  }

  /*
   * Location Bonus
   */
  const premiumCities = [
    'Delhi',
    'Noida',
    'Gurugram',
    'Mumbai',
    'Pune',
    'Bengaluru',
    'Hyderabad',
    'Lucknow'
  ]

  if (
    premiumCities.includes(
      lead.city
    )
  ) {
    score += 10
    reasons.push('Location:10')
  }

  if (score > 100) {
    score = 100
  }

  let classification = 'COLD'

  if (score >= 80) {
    classification = 'HOT'
  } else if (score >= 50) {
    classification = 'WARM'
  }

  return {
    score,
    classification,
    reasons
  }
}
