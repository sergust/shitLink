const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = Router()
const User = require('../models/User')
const {check, validationResult} = require('express-validator')
const config = require('config')

router.post(
    '/register',
    [
        check('email', 'Email is incorrect').isEmail(),
        check('password', `Minimun length of password is ${config.get('passwordLength')}`)
            .isLength({ min: config.get('passwordLength') })
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Incorrect credentials'
            })
        }
        const {email, password} = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
            return res.status(400).json({ message: 'This user is exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({ email, password: hashedPassword })

        await user.save()

        res.status(201).json({ message: 'User created!' })
    } catch (e) {
        res.status(500).json({ message: 'Something went wrong... Please try again' })
    }
})

router.post('/login',
    [
        check('email', 'Enter correct email').normalizeEmail().isEmail(),
        check('password', 'Enter password').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Incorrect credentials'
                })
            }

            const { email, password } = req.body

            const user = User.findOne({ email })

            if (!user) {
                return res.send(400).json({ message: 'This user doesn\'t exist' })
            }

            const isMatch = bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect password' })
            }

            const token = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            )

            res.json({ token, userId: user.id })
        } catch (e) {
            res.status(500).json({ message: 'Something went wrong... Please try again' })
        }
})

module.exports = router