import IndustryInsight from '../models/IndustryInsight.js';
import { generateAIIndustryInsights } from '../services/aiService.js';

/**
 * @desc    Get industry insights (checks cache or generates via AI)
 * @route   GET /api/insights/:industry
 * @access  Private
 */
export const getIndustryInsights = async (req, res, next) => {
  const { industry } = req.params;

  try {
    if (!industry) {
      res.status(400);
      throw new Error('Please specify an industry');
    }

    // Check if insights already exist in MongoDB
    let insights = await IndustryInsight.findOne({ industry });

    // If insights exist and are not expired, return them
    if (insights && insights.nextUpdate > new Date()) {
      return res.json(insights);
    }

    // Otherwise, generate new insights using Gemini
    console.log(`Generating fresh insights for industry: ${industry}`);
    const aiInsights = await generateAIIndustryInsights(industry);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const insightData = {
      industry,
      salaryRanges: aiInsights.salaryRanges || [],
      growthRate: aiInsights.growthRate || 0,
      demandLevel: aiInsights.demandLevel || 'Medium',
      topSkills: aiInsights.topSkills || [],
      marketOutlook: aiInsights.marketOutlook || 'Neutral',
      keyTrends: aiInsights.keyTrends || [],
      recommendedSkills: aiInsights.recommendedSkills || [],
      lastUpdated: new Date(),
      nextUpdate: sevenDaysFromNow,
    };

    if (insights) {
      // Update expired cache
      insights = await IndustryInsight.findOneAndUpdate(
        { industry },
        { $set: insightData },
        { new: true }
      );
    } else {
      // Create new cache entry
      insights = await IndustryInsight.create(insightData);
    }

    res.json(insights);
  } catch (error) {
    next(error);
  }
};
