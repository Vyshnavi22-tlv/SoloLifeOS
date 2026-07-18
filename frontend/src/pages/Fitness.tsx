import React, { useState } from 'react'
import {
  Droplet,
  Footprints,
  Scale,
  Plus,
  Trash2,
  Clock,
  Activity
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useToastStore } from '../stores/toastStore'
import { LineChart } from '../components/ui/Chart'
import { saveUserData } from '../lib/persistence'

interface Workout {
  id: string
  date: string
  name: string
  type: 'strength' | 'cardio' | 'flexibility'
  duration: number // minutes
  sets?: number
  reps?: number
  weight?: number // kg
}

interface WeightLog {
  label: string
  value: number // kg
}

export const Fitness: React.FC = () => {
  const { addToast } = useToastStore()

  const todayStr = new Date().toISOString().split('T')[0]

  // Load fitness from cache
  const cachedFitness = (() => {
    const cached = localStorage.getItem('sololifeos_fitness')
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {}
    }
    return null
  })()

  // Seed Workouts
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    return cachedFitness?.workouts || [
      { id: 'w-1', date: todayStr, name: 'Evening Jogging', type: 'cardio', duration: 30 },
      { id: 'w-2', date: todayStr, name: 'Dumbbell Bench Press', type: 'strength', duration: 25, sets: 4, reps: 10, weight: 24 },
      { id: 'w-3', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], name: 'Hatha Yoga', type: 'flexibility', duration: 45 }
    ]
  })

  // Seed Weight Logs
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
    return cachedFitness?.weightLogs || [
      { label: 'Wk 1', value: 74.2 },
      { label: 'Wk 2', value: 73.8 },
      { label: 'Wk 3', value: 73.5 },
      { label: 'Wk 4', value: 73.1 }
    ]
  })

  // Daily metrics states
  const [waterIntake, setWaterIntake] = useState<number>(() => {
    return cachedFitness?.waterIntake !== undefined ? cachedFitness.waterIntake : 1500
  })
  const [dailySteps, setDailySteps] = useState<number>(() => {
    return cachedFitness?.dailySteps !== undefined ? cachedFitness.dailySteps : 6540
  })
  const [stepsGoal] = useState(10000)
  const [waterGoal] = useState(3000)

  React.useEffect(() => {
    saveUserData('fitness', { workouts, weightLogs, waterIntake, dailySteps })
  }, [workouts, weightLogs, waterIntake, dailySteps])

  // Modals States
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false)
  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false)

  // Workout Form Fields
  const [wkName, setWkName] = useState('')
  const [wkType, setWkType] = useState<Workout['type']>('strength')
  const [wkDuration, setWkDuration] = useState('')
  const [wkSets, setWkSets] = useState('')
  const [wkReps, setWkReps] = useState('')
  const [wkWeight, setWkWeight] = useState('')
  const [wkDate, setWkDate] = useState(todayStr)

  // Weight Form Fields
  const [wgVal, setWgVal] = useState('')

  // Steps Form Field
  const [stVal, setStVal] = useState('')

  // Computations
  const totalDurationToday = workouts
    .filter((w) => w.date === todayStr)
    .reduce((acc, w) => acc + w.duration, 0)

  const caloriesBurnedToday = Math.round(totalDurationToday * 7.5 + (dailySteps * 0.04))

  // Handlers
  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    const durationNum = parseInt(wkDuration)
    if (!wkName.trim() || isNaN(durationNum) || durationNum <= 0) {
      addToast('Workout name and valid duration are required', 'warning')
      return
    }

    const setsNum = parseInt(wkSets)
    const repsNum = parseInt(wkReps)
    const weightNum = parseFloat(wkWeight)

    const newWk: Workout = {
      id: `w-${Math.random().toString(36).substr(2, 9)}`,
      date: wkDate,
      name: wkName,
      type: wkType,
      duration: durationNum,
      sets: isNaN(setsNum) ? undefined : setsNum,
      reps: isNaN(repsNum) ? undefined : repsNum,
      weight: isNaN(weightNum) ? undefined : weightNum
    }

    setWorkouts([newWk, ...workouts])
    addToast('Workout logged successfully!', 'success')
    setIsWorkoutModalOpen(false)

    // Reset Form
    setWkName('')
    setWkDuration('')
    setWkSets('')
    setWkReps('')
    setWkWeight('')
  }

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(workouts.filter((w) => w.id !== id))
    addToast('Workout log deleted', 'error')
  }

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault()
    const valNum = parseFloat(wgVal)
    if (isNaN(valNum) || valNum <= 0) {
      addToast('Please enter a valid weight value', 'warning')
      return
    }

    const nextWkLabel = `Wk ${weightLogs.length + 1}`
    setWeightLogs([...weightLogs, { label: nextWkLabel, value: valNum }])
    addToast('Weight log registered!', 'success')
    setIsWeightModalOpen(false)
    setWgVal('')
  }

  const handleSaveSteps = (e: React.FormEvent) => {
    e.preventDefault()
    const stepsNum = parseInt(stVal)
    if (isNaN(stepsNum) || stepsNum < 0) {
      addToast('Please enter a valid step count', 'warning')
      return
    }

    setDailySteps(stepsNum)
    addToast('Daily step count updated!', 'success')
    setIsStepsModalOpen(false)
    setStVal('')
  }

  const incrementWater = (amount: number) => {
    setWaterIntake((prev) => {
      const next = prev + amount
      if (next >= waterGoal && prev < waterGoal) {
        addToast('🎉 Hydration Goal Achieved! Great job.', 'success')
      } else {
        addToast(`Added +${amount}ml water`, 'info')
      }
      return next
    })
  }

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].value : 70

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Fitness & Health 🏋️
          </h1>
          <p className="text-slate-500 mt-1">Track physical workouts, daily hydration, steps, and weight trends.</p>
        </div>
        <Button onClick={() => setIsWorkoutModalOpen(true)}>
          <Plus size={14} className="mr-1" /> Log Workout
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Steps Count', value: `${dailySteps} / ${stepsGoal}`, icon: <Footprints className="text-indigo-500" size={16} /> },
          { label: 'Water Drunk', value: `${waterIntake} / ${waterGoal} ml`, icon: <Droplet className="text-sky-500" size={16} /> },
          { label: 'Active Duration', value: `${totalDurationToday} mins`, icon: <Clock className="text-pink-500" size={16} /> },
          { label: 'Calories Burned', value: `${caloriesBurnedToday} kcal`, icon: <Activity className="text-emerald-500" size={16} /> }
        ].map((stat, idx) => (
          <Card key={idx} variant="white" className="flex items-center gap-4 p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-lg font-black text-slate-800 mt-0.5">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left main workouts logs */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="white" className="space-y-4">
            <h2 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Today's Workout Logs</h2>
            <div className="divide-y divide-slate-100">
              {workouts.filter((w) => w.date === todayStr).length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic">No workouts logged for today yet.</div>
              ) : (
                workouts
                  .filter((w) => w.date === todayStr)
                  .map((w) => (
                    <div key={w.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4 font-medium">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">{w.name}</h4>
                        <div className="flex flex-wrap gap-2 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm">{w.type}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={8} /> {w.duration} mins
                          </span>
                          {w.type === 'strength' && w.sets && w.reps && (
                            <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-sm">
                              {w.sets} sets x {w.reps} reps {w.weight ? `@ ${w.weight}kg` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteWorkout(w.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </Card>

          {/* Weight tracker line chart */}
          <Card variant="white" className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                <Scale size={14} className="text-indigo-500" /> Body Weight Trend (kg)
              </h3>
              <button
                onClick={() => setIsWeightModalOpen(true)}
                className="text-[10px] text-sky-500 font-extrabold hover:text-sky-600 cursor-pointer"
              >
                + Log Weight
              </button>
            </div>
            <LineChart height={130} data={weightLogs} />
          </Card>
        </div>

        {/* Right side panels for steps and hydration logs */}
        <div className="space-y-6">
          {/* Hydration quick logger card */}
          <Card variant="glass-blue" className="space-y-4 border border-sky-200/20">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100/50 pb-2">
              <Droplet size={14} className="text-sky-500" /> Water hydration log
            </h3>
            <div className="text-center py-2 space-y-1">
              <p className="text-2xl font-black text-slate-800">{waterIntake} ml</p>
              <p className="text-[10px] text-slate-400 font-semibold">Goal: {waterGoal} ml ({Math.round((waterIntake / waterGoal) * 100)}%)</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => incrementWater(250)} variant="secondary" size="sm" className="flex-1 text-[10px] py-1">
                +250ml ☕
              </Button>
              <Button onClick={() => incrementWater(500)} variant="secondary" size="sm" className="flex-1 text-[10px] py-1">
                +500ml 🥤
              </Button>
              <Button onClick={() => incrementWater(750)} variant="secondary" size="sm" className="flex-1 text-[10px] py-1">
                +750ml 🧴
              </Button>
            </div>
          </Card>

          {/* Steps counter quick update card */}
          <Card variant="white" className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Footprints size={14} className="text-indigo-500" /> Steps tracking
              </h3>
              <button
                onClick={() => setIsStepsModalOpen(true)}
                className="text-[10px] text-sky-500 font-extrabold hover:text-sky-600 cursor-pointer"
              >
                Update Count
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Daily step goal</span>
                <span>{Math.round((dailySteps / stepsGoal) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-400 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (dailySteps / stepsGoal) * 100)}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Log Workout Modal */}
      <Dialog
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        title="Log Workout Activity 🏋️"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsWorkoutModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveWorkout} variant="primary">Log Workout</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveWorkout} className="space-y-4">
          <Input
            label="Exercise Name"
            placeholder="Bench press, running, swimming..."
            value={wkName}
            onChange={(e) => setWkName(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Workout Type"
              value={wkType}
              onChange={(e) => setWkType(e.target.value as any)}
              options={[
                { value: 'strength', label: 'Strength' },
                { value: 'cardio', label: 'Cardio' },
                { value: 'flexibility', label: 'Flexibility / Yoga' }
              ]}
            />
            <Input
              label="Duration (mins)"
              placeholder="30"
              value={wkDuration}
              onChange={(e) => setWkDuration(e.target.value)}
            />
            <Input
              label="Date"
              type="date"
              value={wkDate}
              onChange={(e) => setWkDate(e.target.value)}
            />
          </div>

          {wkType === 'strength' && (
            <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-3">
              <Input
                label="Sets"
                placeholder="4"
                value={wkSets}
                onChange={(e) => setWkSets(e.target.value)}
              />
              <Input
                label="Reps"
                placeholder="10"
                value={wkReps}
                onChange={(e) => setWkReps(e.target.value)}
              />
              <Input
                label="Weight (kg)"
                placeholder="60"
                value={wkWeight}
                onChange={(e) => setWkWeight(e.target.value)}
              />
            </div>
          )}
        </form>
      </Dialog>

      {/* Log Weight Modal */}
      <Dialog
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        title="Log Body Weight ⚖️"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsWeightModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveWeight} variant="primary">Log Weight</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveWeight} className="space-y-4">
          <Input
            label={`Weight Value in kg (Current: ${currentWeight}kg)`}
            placeholder="72.5"
            value={wgVal}
            onChange={(e) => setWgVal(e.target.value)}
          />
        </form>
      </Dialog>

      {/* Steps Update Modal */}
      <Dialog
        isOpen={isStepsModalOpen}
        onClose={() => setIsStepsModalOpen(false)}
        title="Update Step Count 🚶"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsStepsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSteps} variant="primary">Update</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveSteps} className="space-y-4">
          <Input
            label={`Steps Taken Today (Current: ${dailySteps})`}
            placeholder="8000"
            value={stVal}
            onChange={(e) => setStVal(e.target.value)}
          />
        </form>
      </Dialog>
    </div>
  )
}
