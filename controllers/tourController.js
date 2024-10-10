const multer = require('multer');
const sharp = require('sharp');
const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const catchAsync = require("./../utils/catchAsync")
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Upload only images.", 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.resizeTourImage = catchAsync( async (req, res, next) => {
  console.log(req.files);

  if(!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

    await sharp(file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${filename}`);

    req.body.images.push(filename);
    })
  )

  next();
});

exports.uploadTourImage = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3}
]);


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}

exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


// exports.getAllTours = catchAsync(async (req, res) => {
//     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
//     const tours = await features.query;

//     res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });


// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });


// exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     // Tour.findOne({ _id: req.params.id });

//     if(!tour) {
//       return next(new AppError('No tour found with that Id', 404));
//     }
//     res.status(201).json({
//       statsu: 'success',
//       data: {
//         tour
//       }
//     })
// });


// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     })

//     if(!tour) {
//       return next(new AppError('No tour found with that Id', 404));
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour
//       },
//     });
// });


// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if(!tour) {
//       return next(new AppError('No tour found with that Id', 404));
//     }

//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          totalTours: { $sum: 1 },
          totalRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          totalToursStarts: { $sum: 1 },
          tours: { $push: '$name'}
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: { _id: 0 }
      },
      {
        $sort: { totalToursStarts: -1 }
      }, 
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      },
    });
});

// /tours-within/200/center/19.07283000,72.88261000/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if(!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in format lat,lng.'), 400);
  }
  
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  })
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});