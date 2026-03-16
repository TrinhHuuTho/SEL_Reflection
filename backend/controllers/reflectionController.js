const mongoose = require('mongoose');
const Reflection = require('../models/Reflection');

const EMOTION_VALUES = ['happy', 'sad', 'neutral', 'confused', 'angry'];
const VISIBILITY_VALUES = ['public', 'private'];

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const getReflectionOwnerId = (reflection) => {
  if (!reflection?.userId) {
    return null;
  }

  if (typeof reflection.userId === 'string') {
    return reflection.userId;
  }

  if (reflection.userId._id) {
    return reflection.userId._id.toString();
  }

  return reflection.userId.toString();
};

const serializeReflection = (reflection) => {
  if (!reflection) {
    return null;
  }

  const ownerId = getReflectionOwnerId(reflection);
  const hasAuthorObject = reflection.userId && typeof reflection.userId === 'object' && reflection.userId._id;

  return {
    id: reflection._id,
    userId: ownerId,
    journeyId: reflection.journeyId,
    nodeId: reflection.nodeId,
    content: reflection.content,
    emotion: reflection.emotion,
    visibility: reflection.visibility,
    createdAt: reflection.createdAt,
    updatedAt: reflection.updatedAt,
    author: hasAuthorObject
      ? {
          id: reflection.userId._id,
          full_name: reflection.userId.full_name,
          avatar: reflection.userId.avatar,
          role: reflection.userId.role
        }
      : null
  };
};

exports.createReflection = async (req, res) => {
  try {
    const journeyId = normalizeString(req.body.journeyId);
    const nodeId = normalizeString(req.body.nodeId);
    const content = normalizeString(req.body.content);
    const emotion = normalizeString(req.body.emotion);
    const visibility = normalizeString(req.body.visibility);

    if (!journeyId || !nodeId || !content) {
      return res.status(400).json({
        success: false,
        message: 'journeyId, nodeId va content la bat buoc'
      });
    }

    if (content.length < 10 || content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Noi dung reflection phai tu 10 den 500 ky tu'
      });
    }

    if (emotion && !EMOTION_VALUES.includes(emotion)) {
      return res.status(400).json({
        success: false,
        message: `emotion khong hop le. Cho phep: ${EMOTION_VALUES.join(', ')}`
      });
    }

    if (visibility && !VISIBILITY_VALUES.includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: `visibility khong hop le. Cho phep: ${VISIBILITY_VALUES.join(', ')}`
      });
    }

    const reflection = new Reflection({
      userId: req.user.id,
      journeyId,
      nodeId,
      content,
      emotion: emotion || null,
      visibility: visibility || 'public'
    });

    await reflection.save();

    return res.status(201).json({
      success: true,
      message: 'Tao reflection thanh cong',
      data: serializeReflection(reflection)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Reflection cho node nay da ton tai. Hay dung API cap nhat.'
      });
    }

    console.error('Create reflection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Loi khi tao reflection',
      error: error.message
    });
  }
};

exports.getReflectionsByJourneyAndNode = async (req, res) => {
  try {
    const journeyId = normalizeString(req.params.journeyId);
    const nodeId = normalizeString(req.params.nodeId);

    if (!journeyId || !nodeId) {
      return res.status(400).json({
        success: false,
        message: 'journeyId va nodeId la bat buoc'
      });
    }

    const reflections = await Reflection.find({ journeyId, nodeId })
      .sort({ updatedAt: -1 })
      .populate('userId', 'full_name avatar role');

    const ownReflection = reflections.find((item) => getReflectionOwnerId(item) === req.user.id) || null;
    const peerReflections = reflections.filter((item) => getReflectionOwnerId(item) !== req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Lay danh sach reflection thanh cong',
      data: {
        ownReflection: serializeReflection(ownReflection),
        peerReflections: peerReflections.map(serializeReflection),
        total: reflections.length
      }
    });
  } catch (error) {
    console.error('Get reflections by journey/node error:', error);
    return res.status(500).json({
      success: false,
      message: 'Loi khi lay danh sach reflection',
      error: error.message
    });
  }
};

exports.updateReflectionById = async (req, res) => {
  try {
    const reflectionId = normalizeString(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      return res.status(400).json({
        success: false,
        message: 'reflection id khong hop le'
      });
    }

    const reflection = await Reflection.findById(reflectionId);

    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay reflection'
      });
    }

    if (getReflectionOwnerId(reflection) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ban chi co the cap nhat reflection cua chinh minh'
      });
    }

    const nextContent = req.body.content !== undefined ? normalizeString(req.body.content) : null;
    const nextEmotion = req.body.emotion !== undefined ? normalizeString(req.body.emotion) : null;
    const nextVisibility = req.body.visibility !== undefined ? normalizeString(req.body.visibility) : null;

    if (nextContent !== null) {
      if (!nextContent || nextContent.length < 10 || nextContent.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Noi dung reflection phai tu 10 den 500 ky tu'
        });
      }

      reflection.content = nextContent;
    }

    if (nextEmotion !== null) {
      if (nextEmotion && !EMOTION_VALUES.includes(nextEmotion)) {
        return res.status(400).json({
          success: false,
          message: `emotion khong hop le. Cho phep: ${EMOTION_VALUES.join(', ')}`
        });
      }

      reflection.emotion = nextEmotion || null;
    }

    if (nextVisibility !== null) {
      if (!VISIBILITY_VALUES.includes(nextVisibility)) {
        return res.status(400).json({
          success: false,
          message: `visibility khong hop le. Cho phep: ${VISIBILITY_VALUES.join(', ')}`
        });
      }

      reflection.visibility = nextVisibility;
    }

    if (nextContent === null && nextEmotion === null && nextVisibility === null) {
      return res.status(400).json({
        success: false,
        message: 'Khong co truong hop le de cap nhat'
      });
    }

    await reflection.save();

    return res.status(200).json({
      success: true,
      message: 'Cap nhat reflection thanh cong',
      data: serializeReflection(reflection)
    });
  } catch (error) {
    console.error('Update reflection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Loi khi cap nhat reflection',
      error: error.message
    });
  }
};

exports.deleteReflectionById = async (req, res) => {
  try {
    const reflectionId = normalizeString(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      return res.status(400).json({
        success: false,
        message: 'reflection id khong hop le'
      });
    }

    const reflection = await Reflection.findById(reflectionId);

    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay reflection'
      });
    }

    if (getReflectionOwnerId(reflection) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Ban chi co the xoa reflection cua chinh minh'
      });
    }

    await reflection.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Xoa reflection thanh cong'
    });
  } catch (error) {
    console.error('Delete reflection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Loi khi xoa reflection',
      error: error.message
    });
  }
};
