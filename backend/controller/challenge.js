"use strict";

/** @module Challenge Controller */

let express = require('express'),
    router = express.Router(),
    dao = require('../middleware/dao');

/**
 * Route: /api/challenge
 */
router.route('/')
    /**
     * Route to get all challenges.
     */
    .get(function(req, res, next) {
        dao.allChallenges()
            .then(challenges => res.json(challenges))
            .catch(err => next(err));
    });


/**
 * Route: /api/challenge/route
 */
router.route('/route')
    /**
     * Route to challenge a route.
     */
    .post(function(req, res, next) {
        dao.challengeRoute(req.body)
            .then(challenge => res.json(challenge))
            .catch(err => next(err));
    });

/**
 * Route: /api/challenge/:id
 */
router.route('/:id')
    /**
     * Route to get a challenge by its id.
     */
    .get(function(req, res, next) {
        dao.challengeById(req.params.id)
            .then(challenge => res.json(challenge))
            .catch(err => next(err));
    })

/**
 * Route to delete a challenge by its id.
 */
.delete(function(req, res, next) {
    dao.deleteChallenge(req.params.id)
        .then(challenge => res.json(challenge))
        .catch(err => next(err));
});

/**
 * Route: /api/challenge/byUser/:userId
 */
router.route('/byUser/:userId')
    /**
     * Route to get all challenges of a specific user.
     */
    .get(function(req, res, next) {
        dao.challengesByUserId(req.params.userId)
            .then(challenges => res.json(challenges))
            .catch(err => next(err));
    });

/**
 * Route: /api/challenge/byRoute/:routeId
 */
router.route('/byRoute/:routeId')
    /**
     * Route to get all challenges of a specific route.
     */
    .get(function(req, res, next) {
        dao.challengesByRouteId(req.params.routeId)
            .then(challenges => res.json(challenges))
            .catch(err => next(err));
    });

module.exports = router;
